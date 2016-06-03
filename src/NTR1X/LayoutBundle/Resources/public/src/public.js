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
                '/admin': {
                    component: Shell.Shell
                },
            };

            for (var i = 0; i < data.model.pages.length; i++) {
                var page = data.model.pages[i];
                routes[page.name] = {
                    component: {
                        template: `<h3>${page.name}</h3>`
                    },
                };
            }

            router.map(routes);

            router.start(App, $('[data-vue-body]', element).get(0));
        })
    });

})(jQuery, Vue, Shell);
