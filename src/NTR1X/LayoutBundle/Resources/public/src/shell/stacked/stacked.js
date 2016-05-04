(function($,Vue, undefined) {

    Vue.component('shell-stacked', {

        template: '#shell-stacked',
        props: {
        },
        ready: function() {

            $(this.$el)
                .sortable({
                    revert: 200,
                    connectWith: ".ge.ge-stacked",

                    beforeStop: function(event, ui) {
                        this.draggable = ui.item;
                    }.bind(this),

                    receive: function(event, ui) {

                        console.log($(this.draggable).data('widget'));

                        // TODO Create widget and place it here
                        var el =
                        $('<div>').css({
                            background: 'red',
                            height: '100px'
                        });

                        $(this.draggable).replaceWith(el);
                        this.draggable = null;
                    }.bind(this),
                })
            ;
        }
    });

})(jQuery, Vue);
