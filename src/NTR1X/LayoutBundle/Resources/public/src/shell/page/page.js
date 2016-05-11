

(function($, Vue, Core, undefined) {

    Vue.component('shell-page', {
        template: '#shell-page',
        mixins: [ /*Core.ContainerMixin, Core.SortableMixin*/ ],
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
        data: function() {
            return {
                decorator: this.decorator,
                data: this.data,
            };
        },
        ready: function() {

            this.decorator = 'shell-decorator-canvas';
            this.data = {};

            this.$watch('page.sources', (sources) => {

                if (sources) {

                    for (var i = 0; i < sources.length; i++) {

                        var s = sources[i];

                        var query = {};
                        for (var i = 0; i < s.params.length; i++) {
                            var param = s.params[i];
                            if (param.in == 'query' && param.specified) {

                                var value = param.binding
                                    ? this.$interpolate(param.binding) // TODO Interpolate in page context
                                    : param.value
                                ;

                                query[param.name] = value;
                            }
                        }

                        $.ajax({
                            method: s.method,
                            url: s.url,
                            dataType: "json",
                            data: query,
                        })
                        .done((d) => {

                            this.$set('data.' + s.name, d);

                            // Object.assign(this.data, ext);
                            // console.log(this.data);
                        });
                    }
                }

            }, {
                immediate: true,
                deep: true,
            });
        },
    });

})(jQuery, Vue, Core);
