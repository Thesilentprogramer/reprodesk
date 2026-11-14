use near_sdk::{env, near, AccountId, NearToken, PanicOnDefault, Promise};
use std::collections::BTreeMap;

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Submission { pub id: u64, pub worker: AccountId, pub query_spec_hash: String, pub result_hash: String, pub report_cid_or_hash: String, pub status: String, pub recomputed_result_hash: Option<String> }
#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Job { pub id: u64, pub poster: AccountId, pub claim_text: String, pub query_spec_json: String, pub query_spec_hash: String, pub deadline: u64, pub bounty_yocto: u128, pub status: String, pub submissions: Vec<Submission> }
#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract { next_id: u64, jobs: BTreeMap<u64, Job>, verifier: AccountId }
fn hash(s: &str) -> String { env::sha256(s.as_bytes()).iter().map(|b| format!("{b:02x}")).collect() }
fn valid_hash(s: &str) -> bool { s.len() == 64 && s.bytes().all(|b| b.is_ascii_hexdigit()) }
fn event(name: &str, data: String) { env::log_str(&format!("EVENT_JSON:{{\"standard\":\"reprodesk\",\"version\":\"1.0.0\",\"event\":\"{name}\",\"data\":[{data}]}}")); }
#[near]
impl Contract {
 #[init] pub fn new(verifier: AccountId) -> Self { Self { next_id: 0, jobs: BTreeMap::new(), verifier } }
 #[payable] pub fn post_job(&mut self, claim_text: String, query_spec_json: String, deadline: u64) -> u64 {
  let bounty = env::attached_deposit().as_yoctonear();
  assert!(bounty >= 100_000_000_000_000_000_000_000, "Minimum 0.1 NEAR");
  assert!(!claim_text.is_empty() && !query_spec_json.is_empty(), "Fields required");
  assert!(deadline > env::block_timestamp(), "Future deadline required");
  let id = self.next_id; self.next_id += 1;
  self.jobs.insert(id, Job { id, poster: env::predecessor_account_id(), claim_text, query_spec_hash: hash(&query_spec_json), query_spec_json, deadline, bounty_yocto: bounty, status: "open".into(), submissions: vec![] });
  event("job_posted", format!("{{\"job_id\":{id}}}")); id
 }
 pub fn submit(&mut self, job_id: u64, query_spec_hash: String, result_hash: String, report_cid_or_hash: String) -> u64 {
  let job = self.jobs.get_mut(&job_id).expect("Job missing");
  assert_eq!(job.status, "open", "Job closed"); assert!(env::block_timestamp() < job.deadline, "Deadline passed");
  assert_eq!(query_spec_hash, job.query_spec_hash, "Query spec mismatch"); assert!(valid_hash(&result_hash) && valid_hash(&report_cid_or_hash), "SHA-256 hex required");
  let worker = env::predecessor_account_id(); assert_ne!(worker, job.poster, "Poster cannot submit");
  let id = job.submissions.len() as u64;
  job.submissions.push(Submission { id, worker, query_spec_hash, result_hash, report_cid_or_hash, status: "pending".into(), recomputed_result_hash: None });
  event("submitted", format!("{{\"job_id\":{job_id},\"submission_id\":{id}}}")); id
 }
 pub fn verify(&mut self, job_id: u64, submission_id: u64, recomputed_result_hash: String) {
  assert_eq!(env::predecessor_account_id(), self.verifier, "Registered verifier only"); assert!(valid_hash(&recomputed_result_hash), "SHA-256 hex required");
  let job = self.jobs.get_mut(&job_id).expect("Job missing"); assert_eq!(job.status, "open", "Job closed");
  let sub = job.submissions.get_mut(submission_id as usize).expect("Submission missing"); assert_eq!(sub.status, "pending", "Already verified");
  let accepted = sub.result_hash == recomputed_result_hash; sub.recomputed_result_hash = Some(recomputed_result_hash);
  sub.status = if accepted { "paid" } else { "rejected" }.into();
  if accepted { job.status = "paid".into(); Promise::new(sub.worker.clone()).transfer(NearToken::from_yoctonear(job.bounty_yocto)).detach(); }
  event("verified", format!("{{\"job_id\":{job_id},\"submission_id\":{submission_id},\"accepted\":{accepted}}}"));
 }
 pub fn refund(&mut self, job_id: u64) {
  let job = self.jobs.get_mut(&job_id).expect("Job missing"); assert_eq!(job.status, "open", "Job closed");
  assert!(env::block_timestamp() >= job.deadline, "Deadline not passed"); job.status = "refunded".into();
  Promise::new(job.poster.clone()).transfer(NearToken::from_yoctonear(job.bounty_yocto)).detach();
  event("refunded", format!("{{\"job_id\":{job_id}}}"));
 }
 pub fn get_job(&self, job_id: u64) -> Option<Job> { self.jobs.get(&job_id).cloned() }
 pub fn get_jobs(&self) -> Vec<Job> { self.jobs.values().cloned().collect() }
 pub fn get_submissions(&self, job_id: u64) -> Vec<Submission> { self.jobs.get(&job_id).expect("Job missing").submissions.clone() }
 pub fn next_job_id(&self) -> u64 { self.next_id }
 pub fn get_verifier(&self) -> AccountId { self.verifier.clone() }
}
#[cfg(test)] mod tests { use super::*; use near_sdk::{testing_env, test_utils::VMContextBuilder};
 fn actor(name:&str, deposit:u128, time:u64) { testing_env!(VMContextBuilder::new().predecessor_account_id(name.parse().unwrap()).attached_deposit(NearToken::from_yoctonear(deposit)).block_timestamp(time).build()); }
 #[test] fn payment_and_rejection() { actor("poster.testnet", 200_000_000_000_000_000_000_000, 1); let mut c=Contract::new("verifier.testnet".parse().unwrap()); let id=c.post_job("claim".into(),"{}".into(),100); actor("bad.testnet",0,2); c.submit(id,hash("{}"),"a".repeat(64),"b".repeat(64)); actor("verifier.testnet",0,3); c.verify(id,0,"c".repeat(64)); assert_eq!(c.get_submissions(id)[0].status,"rejected"); actor("good.testnet",0,4); c.submit(id,hash("{}"),"c".repeat(64),"d".repeat(64)); actor("verifier.testnet",0,5); c.verify(id,1,"c".repeat(64)); assert_eq!(c.get_job(id).unwrap().status,"paid"); }
 #[test] #[should_panic(expected="Registered verifier only")] fn unauthorized() { actor("poster.testnet",200_000_000_000_000_000_000_000,1); let mut c=Contract::new("verifier.testnet".parse().unwrap()); c.post_job("claim".into(),"{}".into(),100); c.verify(0,0,"a".repeat(64)); }
 #[test] fn refund_after_deadline() { actor("poster.testnet",200_000_000_000_000_000_000_000,1); let mut c=Contract::new("verifier.testnet".parse().unwrap()); c.post_job("claim".into(),"{}".into(),100); actor("any.testnet",0,100); c.refund(0); assert_eq!(c.get_job(0).unwrap().status,"refunded"); }
}
