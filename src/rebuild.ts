import { view } from './chain.js';
import { runQuery, type QuerySpec } from './data.js';
const id=Number(process.argv[2]); if (!Number.isInteger(id)) throw Error('Usage: npm run rebuild -- <job_id>');
const job=await view<{query_spec_json:string}>('get_job',{job_id:id}); if (!job) throw Error('Job not found');
const data=await runQuery(JSON.parse(job.query_spec_json) as QuerySpec); console.log(data.canonical_json); console.log(`SHA-256: ${data.hash}`);
