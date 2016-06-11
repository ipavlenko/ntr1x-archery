(function($, Vue, Shell, undefined) {

    // console.log('111');

    $(document).ready(function() {

        $('[data-vue-public]').each(function(index, element) {

            var data = $(element).data();

            var App = Vue.extend({
                data: function() {
                    return data;
                },
            });

            var router = new VueRouter({
                history: true,
            });

            var routes = {
                '/': {
                    component: Landing.LandingPage,
                },
                '/gallery': {
                    component: Landing.LandingGalleryPage
                },
                '/storage': {
                    component: Landing.LandingStoragePage
                },
                '/signin': {
                    component: Landing.LandingSigninPage
                },
                '/signup': {
                    component: Landing.LandingSignupPage
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
