(function($,Vue, undefined) {

    Vue.component('shell-stacked', {

        template: '#shell-stacked',
        props: {
        },
        ready: function() {

            Sortable.create(this.$el, {
                group: {
                    name: 'widgets',
                },
                animation: 150,
                onAdd: function (evt) {

                    // .$mount().$appendTo($('body').get(0));
                    //
                    // var el = new 

                    var el =
                        $('<div>').css({
                            background: 'red',
                            height: '100px'
                        });

                        $(evt.item).replaceWith(el);

                    // $(evt.item).
                    // var itemEl = evt.item;  // dragged HTMLElement
                    // evt.from;  // previous list
                    // + indexes from onEnd
                },
            });
            // $(this.$el)
            //     .sortable({
            //         revert: 200,
            //         connectWith: ".ge.ge-stacked",
            //
            //         beforeStop: function(event, ui) {
            //             this.draggable = ui.item;
            //         }.bind(this),
            //
            //         receive: function(event, ui) {
            //
            //             console.log($(this.draggable).data('widget'));
            //
            //             // TODO Create widget and place it here
            //             var el =
            //             $('<div>').css({
            //                 background: 'red',
            //                 height: '100px'
            //             });
            //
            //             $(this.draggable).replaceWith(el);
            //             this.draggable = null;
            //         }.bind(this),
            //     })
            // ;
        }
    });

})(jQuery, Vue);
