use near_sdk::{env, json_types::U128, near, AccountId, NearToken, PanicOnDefault, Promise};
use std::collections::BTreeMap;

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Bid {
    pub worker: AccountId,
    pub amount_yocto: u128,
}

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Task {
    pub id: u64,
    pub requester: AccountId,
    pub reviewer: AccountId,
    pub coordinator: AccountId,
    pub description: String,
    pub source_url: String,
    pub expected_field: String,
    pub escrow_yocto: u128,
    pub bids: Vec<Bid>,
    pub winner: Option<AccountId>,
    pub result_hash: Option<String>,
    pub evidence_hash: Option<String>,
    pub verdict: Option<bool>,
    pub settled: bool,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    next_id: u64,
    tasks: BTreeMap<u64, Task>,
}

#[near]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self { next_id: 0, tasks: BTreeMap::new() }
    }

    #[payable]
    pub fn post_task(&mut self, reviewer: AccountId, coordinator: AccountId, description: String, source_url: String, expected_field: String) -> u64 {
        let escrow = env::attached_deposit().as_yoctonear();
        assert!(escrow > 0, "Escrow required");
        assert!(!description.is_empty() && !source_url.is_empty() && !expected_field.is_empty(), "Task fields required");
        let id = self.next_id;
        self.next_id += 1;
        self.tasks.insert(id, Task {
            id, requester: env::predecessor_account_id(), reviewer, coordinator,
            description, source_url, expected_field, escrow_yocto: escrow,
            bids: vec![], winner: None, result_hash: None, evidence_hash: None,
            verdict: None, settled: false,
        });
        id
    }

    pub fn bid(&mut self, task_id: u64, amount_yocto: U128) {
        let actor = env::predecessor_account_id();
        let task = self.task_mut(task_id);
        assert!(!task.settled && task.winner.is_none(), "Bidding closed");
        assert!(actor != task.requester && actor != task.reviewer && actor != task.coordinator, "Role cannot bid");
        assert!(amount_yocto.0 > 0 && amount_yocto.0 <= task.escrow_yocto, "Invalid bid");
        assert!(!task.bids.iter().any(|b| b.worker == actor), "Already bid");
        task.bids.push(Bid { worker: actor, amount_yocto: amount_yocto.0 });
    }

    pub fn select_winner(&mut self, task_id: u64) -> AccountId {
        let actor = env::predecessor_account_id();
        let task = self.task_mut(task_id);
        assert_eq!(actor, task.coordinator, "Coordinator only");
        assert!(task.winner.is_none() && !task.settled, "Already selected");
        let winner = task.bids.iter().min_by(|a, b| a.amount_yocto.cmp(&b.amount_yocto).then(a.worker.cmp(&b.worker)))
            .expect("No bids").worker.clone();
        task.winner = Some(winner.clone());
        winner
    }

    pub fn submit(&mut self, task_id: u64, result_hash: String) {
        let actor = env::predecessor_account_id();
        let task = self.task_mut(task_id);
        assert_eq!(task.winner.as_ref(), Some(&actor), "Winner only");
        assert!(!task.settled && task.result_hash.is_none(), "Already submitted");
        assert!(result_hash.len() == 64 && result_hash.bytes().all(|c| c.is_ascii_hexdigit()), "SHA-256 hex required");
        task.result_hash = Some(result_hash);
    }

    pub fn review(&mut self, task_id: u64, accepted: bool, evidence_hash: String) {
        let actor = env::predecessor_account_id();
        let task = self.task_mut(task_id);
        assert_eq!(actor, task.reviewer, "Reviewer only");
        assert!(task.result_hash.is_some() && task.verdict.is_none() && !task.settled, "Not reviewable");
        assert!(evidence_hash.len() == 64 && evidence_hash.bytes().all(|c| c.is_ascii_hexdigit()), "SHA-256 hex required");
        task.verdict = Some(accepted);
        task.evidence_hash = Some(evidence_hash);
    }

    pub fn settle(&mut self, task_id: u64) {
        let actor = env::predecessor_account_id();
        let task = self.task_mut(task_id);
        assert_eq!(actor, task.coordinator, "Coordinator only");
        assert!(!task.settled, "Already settled");
        let accepted = task.verdict.expect("Review required");
        task.settled = true;
        if accepted {
            let winner = task.winner.clone().expect("No winner");
            let bid = task.bids.iter().find(|b| b.worker == winner).expect("Missing bid").amount_yocto;
            Promise::new(winner).transfer(NearToken::from_yoctonear(bid)).detach();
            if task.escrow_yocto > bid {
                Promise::new(task.requester.clone()).transfer(NearToken::from_yoctonear(task.escrow_yocto - bid)).detach();
            }
        } else {
            Promise::new(task.requester.clone()).transfer(NearToken::from_yoctonear(task.escrow_yocto)).detach();
        }
    }

    pub fn get_task(&self, task_id: u64) -> Option<Task> { self.tasks.get(&task_id).cloned() }
    pub fn next_task_id(&self) -> u64 { self.next_id }

    fn task_mut(&mut self, id: u64) -> &mut Task { self.tasks.get_mut(&id).expect("Task not found") }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn account(s: &str) -> AccountId { s.parse().unwrap() }
    fn as_actor(name: &str, deposit: u128) {
        testing_env!(VMContextBuilder::new().predecessor_account_id(account(name))
            .attached_deposit(NearToken::from_yoctonear(deposit)).build());
    }
    fn setup() -> Contract {
        as_actor("requester.testnet", 300_000_000_000_000_000_000_000);
        let mut c = Contract::new();
        c.post_task(account("reviewer.testnet"), account("coordinator.testnet"),
            "Find value".into(), "https://example.com/data.json".into(), "value".into());
        as_actor("worker1.testnet", 0);
        c.bid(0, U128(200_000_000_000_000_000_000_000));
        as_actor("worker2.testnet", 0);
        c.bid(0, U128(250_000_000_000_000_000_000_000));
        c
    }
    #[test]
    fn accepts_lowest_bid_and_settles_once() {
        let mut c = setup();
        as_actor("coordinator.testnet", 0);
        assert_eq!(c.select_winner(0), account("worker1.testnet"));
        as_actor("worker1.testnet", 0);
        c.submit(0, "a".repeat(64));
        as_actor("reviewer.testnet", 0);
        c.review(0, true, "b".repeat(64));
        as_actor("coordinator.testnet", 0);
        c.settle(0);
        assert!(c.get_task(0).unwrap().settled);
    }
    #[test]
    fn rejection_refunds() {
        let mut c = setup();
        as_actor("coordinator.testnet", 0); c.select_winner(0);
        as_actor("worker1.testnet", 0); c.submit(0, "a".repeat(64));
        as_actor("reviewer.testnet", 0); c.review(0, false, "b".repeat(64));
        as_actor("coordinator.testnet", 0); c.settle(0);
        assert_eq!(c.get_task(0).unwrap().verdict, Some(false));
    }
    #[test]
    #[should_panic(expected = "Reviewer only")]
    fn worker_cannot_review() {
        let mut c = setup();
        as_actor("coordinator.testnet", 0); c.select_winner(0);
        as_actor("worker1.testnet", 0); c.submit(0, "a".repeat(64));
        c.review(0, true, "b".repeat(64));
    }
}
