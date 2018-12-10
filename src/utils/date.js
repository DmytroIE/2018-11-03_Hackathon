export function formDateString(divider, order = 0) {
  const date = new Date();
  if (order !== 0) {
      return (date.getFullYear() + 
      divider +
      (date.getMonth() < 9 ? '0' + date.getMonth() + 1: date.getMonth() + 1) +
      divider +
      (date.getDate() < 10 ? '0' + date.getDate(): date.getDate()));
  } else {
    return ((date.getDate() < 10 ? '0' + date.getDate(): date.getDate()) +
    didvider +
    (date.getMonth() < 9 ? '0' + date.getMonth() + 1: date.getMonth() + 1) +
    didvider + 
    date.getFullYear());
  }
}