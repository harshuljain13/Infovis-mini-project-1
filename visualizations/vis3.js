
function vis3(data, div) {
    var donor_data = Array.from(d3.rollup(data, rec=>d3.sum(rec.map(c=>c.commitment_amount_usd_constant)), d=>d.donor), ([country, amount])=>({country,amount})).sort((a, b) => d3.descending(a.amount, b.amount));
    var recipient_data = Array.from(d3.rollup(data, rec=>-d3.sum(rec.map(c=>c.commitment_amount_usd_constant)), d=>d.recipient), ([country, amount])=>({country,amount})).sort((a, b) => d3.descending(a.amount, b.amount));
    
    
  }
  