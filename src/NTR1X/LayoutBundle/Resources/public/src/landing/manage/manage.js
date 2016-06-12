Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Manage =
    Vue.component('landing-manage', {

        template: '#landing-manage',
        data: function() {
            return {
                domains: this.domains,
            };
        },
        created: function() {

            this.domains = [];

            this.$http({
                url: '/ws/domains',
                method: 'GET',
            }).then(
                (d) => {
                    this.$set('domains', d['domains']);
                },
                (e) => {
                }
            );
        },
    });

})(Vue, jQuery, Landing);
