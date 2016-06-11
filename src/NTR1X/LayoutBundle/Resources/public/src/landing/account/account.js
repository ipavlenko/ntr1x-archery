Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    var validation = {
        email: "/^([a-zA-Z0-9_\\.\\-]+)@([a-zA-Z0-9_\\.\\-]+)\\.([a-zA-Z0-9]{2,})$/g",
    };

    Landing.Signin =
    Vue.component('landing-account-signin', {
        template: '#landing-account-signin',
        data: function() {
            return {
                form: this.form,
                validation: validation,
            }
        },
        created: function() {
            this.$set('form', {
                email: null,
                password: null,
            });
        },
        methods: {
            doSignin: function() {
                $.ajax({
                    method: 'POST',
                    url: '/do/signin',
                    data: {
                        email: this.form.email,
                        password: this.form.password,
                    },
                })
                .done((d) => {
                    this.$dispatch('updateUser', { user: d });
                });
            }
        },
    });

    Landing.Signup =
    Vue.component('landing-account-signup', {
        template: '#landing-account-signup',
        data: function() {
            return {
                form: this.form,
                validation: validation,
            }
        },
        created: function() {
            this.$set('form', {
                email: null,
                password: null,
            });
        },
        methods: {
            doSignup: function() {
                console.log('doSignup', {
                    email: this.form.email,
                    password: this.form.password,
                });
                $.ajax({
                    method: 'POST',
                    url: '/do/signup',
                    data: {
                        email: this.form.email,
                        password: this.form.password,
                    },
                })
                .done((d) => {
                    this.$dispatch('updateUser', { user: d });
                });
            }
        },
    });

    Landing.Profile =
    Vue.component('landing-account-profile', {
        template: '#landing-account-profile',
    });

})(Vue, jQuery, Landing);
