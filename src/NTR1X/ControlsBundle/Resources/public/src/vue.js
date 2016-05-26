(function($, Vue, undefined) {

    Vue.config.debug = true;
    console.log('Vue.config.debug', Vue.config.debug);

    $(document).ready(function() {

        $('[data-vue]').each(function(index, element) {

            new Vue({
                el: $('[data-vue-body]', element).get(0),
                data: $(element).data(),
            });
        })
    });

})(jQuery, Vue);
