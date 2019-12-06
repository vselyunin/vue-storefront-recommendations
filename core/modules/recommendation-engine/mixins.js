export function filterByRecommendations (products, recommendations) {
  let r =
  recommendations.length > 0
    ? products.filter(elem =>
      recommendations.find(({ id }) => parseInt(elem.id) === parseInt(id))
    )
    : [];

  r.map(el => {
    el.rec = '1'
    return el
  })

  const nr =
  recommendations.length > 0
    ? products.filter(
      elem => !recommendations.find(({ id }) => parseInt(elem.id) === parseInt(id))
    )
    : products;
  nr.map(el => {
    el.rec = ''
    return el
  })
  Array.prototype.push.apply(r, nr);
  return r;
}
