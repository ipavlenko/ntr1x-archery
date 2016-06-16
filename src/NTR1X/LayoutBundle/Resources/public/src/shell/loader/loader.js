(function($, Vue, Shell, undefined) {

    Shell.Loader =
    Vue.component('shell-loader', {
        template: '#shell-loader',
        created: function() {
            console.log(this.$route);
        }
    });

})(jQuery, Vue, Shell);
