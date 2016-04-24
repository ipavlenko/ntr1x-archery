(function($,Vue, undefined) {

    Vue.component('shell-stacked', {

        template: '#shell-stacked',
        props: {
        },
        ready: function() {

            $(this.$el)
                .sortable({
                    revert: 200,
                    
                    beforeStop: function (event, ui) {
                        this.draggable = ui.item;
                    }.bind(this),

                    receive: function(event, ui) {
                        var el =
                        $('<div>').css({
                            background: 'red',
                            height: '100px'
                        });

                        $(this.draggable).replaceWith(el);
                        this.draggable = null;
                    }.bind(this),
                    // drop: function(event, ui) {
                    //     console.log('drop', ui);
                    // }
                })
                // .droppable({
                //     drop: function(event, ui) {
                //
                //         var el =
                //         $('<div>').css({
                //             background: 'red',
                //             height: '100px'
                //         });
                //
                //         $(ui.draggable).replaceWith(el);
                //
                //         // console.log('drop', ui);
                //     }
                // })
            ;
        }
    });

})(jQuery, Vue);
