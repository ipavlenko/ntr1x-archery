(function($,Vue, undefined) {

    Vue.component('shell-stacked', {

        template: '#shell-stacked',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            items: Array,
        },
        ready: function() {

            var self = this;

            Sortable.create(this.$el, {
                group: {
                    name: 'widgets',
                },
                animation: 150,
                onAdd: function (evt) {

                    console.log($(evt.item));

                    $(evt.item).remove();

                    console.log(self.items);

                    self.items.splice(evt.newIndex, 0, {
                        type: $(evt.item).data('widget'),
                        resource: {
                            params: [],
                            _action: 'create'
                        },
                        _action: 'create',
                    });

                    console.log(evt, self.items);

                    // this.items = $.extend(true, [], items);
                    // evt.preventDefault();
                    // items.

                    // .$mount().$appendTo($('body').get(0));
                    //
                    // var el = new

                    // var widget = new Shell.Widget({
                    //     data: {
                    //         globals: this.globals,
                    //         settings: this.settings,
                    //         page: this.page,
                    //         data: {
                    //             type: $(evt.item).data('widget'),
                    //             resource: {
                    //                 params: [],
                    //                 _action: 'create'
                    //             },
                    //             _action: 'create',
                    //         },
                    //     }
                    // });
                    //
                    // var el =
                    //     $('<div>').css({
                    //         background: 'red',
                    //         height: '100px'
                    //     });
                    //
                    //     $(evt.item).replaceWith(el);

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
