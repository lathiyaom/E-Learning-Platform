const dns = require('dns');

console.log("Testing DNS resolution for _mongodb._tcp.cluster0.nrwqytc.mongodb.net...");

dns.resolveSrv('_mongodb._tcp.cluster0.nrwqytc.mongodb.net', (err, addresses) => {
  if (err) {
    console.error("DNS Resolution Error:", err.message);
    process.exit(1);
  } else {
    console.log("Resolved SRV Addresses successfully:");
    console.log(addresses);
    
    // Now test resolving one of the targets to see if A records work
    if (addresses.length > 0) {
      const target = addresses[0].name;
      console.log(`\nTesting A record for ${target}...`);
      dns.resolve4(target, (errA, ips) => {
        if (errA) console.error("A record resolution error:", errA.message);
        else console.log("Resolved IPs for target:", ips);
      });
    }
  }
});
