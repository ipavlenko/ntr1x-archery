Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {

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

    var Stacked = {
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            items: Array,
        },
        ready: function() {

            var self = this;

            Sortable.create($('.wg.wg-table', this.$el).get(0), {
                group: {
                    name: 'widgets',
                },
                animation: 150,

                onAdd: function (evt) {

                    var palette = $(evt.item).closest('.ge.ge-palette');

                    if (!palette.length) {
                        $(evt.item).remove();

                        var i = find(self.items, evt.newIndex);

                        var widget = Shell.Services.Layout.getWidget($(evt.item).data('widget'));

                        self.items.splice(i.index, 0, {
                            type: widget.id,
                            resource: {
                                params: [],
                                _action: 'create'
                            },
                            params: widget.params
                                ? JSON.parse(JSON.stringify(widget.params))
                                : {}
                            ,
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
    };

    Vue.component('default-stack-page', {
        template: '#default-stack-page',
        mixins: [ Stacked ],
    });

    Vue.component('default-stack-horisontal', {
        template: '#default-stack-horisontal',
        mixins: [ Core.WidgetMixin, Stacked ],
        data: function() {
            return {
                items: this.items
            }
        },
        ready: function() {
            this.items = [];
        }
    });

    Vue.component('default-stack-vertical', {
        template: '#default-stack-vertical',
        mixins: [ Core.WidgetMixin, Stacked ],
        data: function() {
            return {
                items: this.items
            }
        },
        ready: function() {
            this.items = [];
        }
    });

})(jQuery, Vue, Core, Shell);
