const schema = {
  title: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    default: 1
  },
  password: {
    type: String,
    required: true
  }
};

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