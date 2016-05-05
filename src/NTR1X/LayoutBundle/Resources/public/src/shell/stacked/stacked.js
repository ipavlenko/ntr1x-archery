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

                    console.log('add', evt);

                    $(evt.item).remove();

                    var index = 0;
                    var item = null;

                    for (var i = 0; i < self.items.length && index < evt.newIndex; i++) {

                        item = self.items[i];

                        if (item._action != 'remove') {
                            index++;
                        }
                    }

                    self.items.splice(index, 0, {
                        type: $(evt.item).data('widget'),
                        resource: {
                            params: [],
                            _action: 'create'
                        },
                        _action: 'create',
                    });

                    // console.log(evt, self.items);
                    self.items = $.extend(true, [], self.items);
                },

                onEnd: function (evt) {
                    // $(evt.item).remove();
                    if  (evt.newIndex != evt.oldIndex) {
                        console.log('end', evt);
                        evt.preventDefault();
                    }
                }
            });
        },
        events: {

            removeWidget: function(data) {

                var index = this.items.indexOf(data.item);
                if (index !== -1) {
                    var item = this.items[index];
                    if (item._action == 'create') {
                        this.items.$remove(item);
                    } else {
                        item._action = 'remove';
                    }
                }

                this.items = $.extend(true, [], this.items);
            }
        }
    });

})(jQuery, Vue);
