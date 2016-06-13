Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Manage =
    Vue.component('landing-manage', {

        template: '#landing-manage',
        data: function() {
            return {
                url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: ''),
                portals: this.portals,
            };
        },
        created: function() {

            this.$set('portals', [
                { id: 1, name: 'jaSWas123asd123', title: 'Московская академия гольфа' },
                { id: 2, name: 'Uewsq34as3as34a', title: 'Российский рейтинг гольфистов' },
            ]);

            // this.$set('portals', []);
            //
            // this.$http({
            //     url: '/ws/portals',
            //     method: 'GET',
            // }).then(
            //     (d) => {
            //         this.$set('portals', d.data.portals);
            //     },
            //     (e) => {
            //     }
            // );
        },
    });

    Landing.ManageCreate =
    Vue.component('landing-manage-create', {
        template: '#landing-manage-create',
        data: function() {
            return {
                form: this.form,
            }
        },
        created: function() {
            this.$set('form', {
                title: null,
            });
        },
    });

})(Vue, jQuery, Landing);
