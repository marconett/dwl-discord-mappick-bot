export function deepCopy(o) {
  var newO, i;

  if (typeof o !== 'object') {
    return o;
  }
  if (!o) {
    return o;
  }

  if (Array.isArray(o)) {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = deepCopy(o[i]);
    }
    return newO;
  }

  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = deepCopy(o[i]);
    }
  }
  return newO;
}