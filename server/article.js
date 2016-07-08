export function *read(next) {
  this.body = {data: this.params};
  yield next;
}

export function *create(next) {
  this.body = {data: this.params};
  yield next;
}

export function *update(next) {
  this.body = {data: this.params};
  yield next;
}

export function *del(next) {
  this.body = {data: this.params};
  yield next;
}