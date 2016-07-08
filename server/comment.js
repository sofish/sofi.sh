export function *read(next) {
  this.body = {data: this.status};
  yield next;
}

export function *create(next) {
  this.body = {data: this.status};
  yield next;
}

export function *del(next) {
  this.body = {data: this.status};
  yield next;
}