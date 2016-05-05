(function($,Vue, undefined) {

    function find(items, domIndex) {

        var index = 0;
        var item = null;

        for (var i = 0; i < items.length && index < domIndex; i++) {

            item = items[i];

            if (item._action != 'remove') {
                index++;
            }
        }

        return {
            item: item,
            index: index,
        };
    }

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

                    var palette = $(evt.item).closest('.ge.ge-palette');
                    console.log(palette);
                    if (!palette.length) {
                        $(evt.item).remove();

                        var i = find(self.items, evt.newIndex);

                        self.items.splice(i.index, 0, {
                            type: $(evt.item).data('widget'),
                            resource: {
                                params: [],
                                _action: 'create'
                            },
                            _action: 'create',
                        });

                        self.items = $.extend(true, [], self.items);
                    }
                },

                onEnd: function (evt) {

                    $(evt.item).remove();

                    if  (evt.newIndex != evt.oldIndex) {

                        evt.preventDefault();

                        var oi = find(self.items, evt.oldIndex);
                        var ni = find(self.items, evt.newIndex);

                        self.items.splice(ni.index, 0, self.items.splice(oi.index, 1)[0]);
                    }

                    self.items = $.extend(true, [], self.items);
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
