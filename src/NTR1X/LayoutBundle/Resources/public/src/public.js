(function($, Vue, Shell, undefined) {

    // console.log('111');

    $(document).ready(function() {

        $('[data-vue-public]').each(function(index, element) {

            var data = $(element).data();

            var App = Vue.extend({
                data: function() {
                    return data;
                },
                created: function() {

                    Vue.service('security', {

                        signup: (data) => {

                            return this.$http({
                                url: '/do/signup',
                                method: 'POST',
                                data: data,
                            })
                            .then(
                                (d) => { this.principal = d; this.$router.go('/'); },
                                (e) => { this.principal = null; }
                            );
                        },

                        signin: (data) => {

                            return this.$http({
                                url: '/do/signin',
                                method: 'POST',
                                data: data,
                            })
                            .then(
                                (d) => { this.principal = d; this.$router.go('/'); },
                                (e) => { this.principal = null; }
                            );
                        },

                        signout: () => {

                            return this.$http({
                                url: '/do/signout',
                                method: 'POST',
                            })
                            .then(
                                (d) => { this.principal = null; this.$router.go('/') },
                                (e) => { }
                            );
                        },

                    });
                },
            });

            var router = new VueRouter({
                history: true,
            });

            router.beforeEach(function(transition) {

                if (transition.to.auth && !router.app.principal) {
                    transition.abort();
                } else if (transition.to.anon && router.app.principal) {
                    transition.abort();
                } else {
                    transition.next();
                }
            });

            var routes = {
                '/': {
                    component: Landing.LandingPage,
                },
                '/gallery': {
                    component: Landing.LandingGalleryPage,
                },
                '/storage': {
                    component: Landing.LandingStoragePage,
                },
                '/signin': {
                    component: Landing.LandingSigninPage,
                    anon: true,
                },
                '/signup': {
                    component: Landing.LandingSignupPage,
                    anon: true,
                },
                '/benefits': {
                    component: {
                        template: '<h3>Benefits</h3>',
                    }
                },
                '/pricing': {
                    component: {
                        template: '<h3>Pricing</h3>',
                    }
                },
                '/contacts': {
                    component: {
                        template: '<h3>Pricing</h3>',
                    }
                },
                '/site/:domain/:page': {
                    component: Shell.ShellPublic,
                },
                '/admin/:domain/:page': {
                    component: Shell.ShellPrivate,
                    private: true,
                },
            };

            function createRoute(page) {
                return {
                    component: Shell.ShellPublic.extend({
                        data: function() {
                            return {
                                page: page,
                            };
                        }
                    }),
                };
            }

            if (data.model) {
                for (var i = 0; i < data.model.pages.length; i++) {

                    var page = data.model.pages[i];
                    routes[page.name] = createRoute(page);
                }
            }

            router.map(routes);

            router.start(App, $('[data-vue-body]', element).get(0));
        })
    });

})(jQuery, Vue, Shell);
