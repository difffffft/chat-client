export const validateEmail = (rule, value, callback) => {
    const reg =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (reg.test(value)) {
        callback()
    } else {
        callback(new Error('邮箱格式不正确'))
    }
}

export const validateRepassword = function (rule, value, callback) {
    if (this.value.password === this.value.repeatPassword) {
        callback()
    } else {
        callback(new Error('密码不一致'))
    }
}