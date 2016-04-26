Core = window.Core || {};

(function($, Vue, Core) {

    //"use strict";

    Core.WidgetMixin = {
        props: {
            data: Object,
            params: Object,
        }
    };

    Vue.component('default-footer', {
        template: '#default-footer',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
