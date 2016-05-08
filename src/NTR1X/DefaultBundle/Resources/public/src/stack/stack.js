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

    var Stacked = function(selector) {
        return {
            props: {
                globals: Object,
                settings: Object,
                page: Object,
                items: Array,
            },
            data: function() {
                return {
                    visibleItems: this.visibleItems,
                    placeholderItems: this.placeholderItems,
                };
            },
            ready: function() {

                this.$watch('items', function(items) {

                    var array = [];
                    if (items) {
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if (item._action != 'remove') {
                                array.push(item);
                            }
                        }
                    }

                    var  placeholders = [];

                    if (array.length < 2) {
                        placeholders.push({});
                    }

                    console.log(array.length);

                    this.visibleItems = array;
                    this.placeholderItems = placeholders;

                }, {
                    immediate: true,
                    deep: true,
                })

                var self = this;

                Sortable.create($(selector, this.$el).get(0), {
                    group: {
                        name: 'widgets',
                    },
                    animation: 150,

                    onSort: function(evt) {
                        console.log(evt);
                        // $(evt.item).html('<b>Data</b>');
                    },

                    onAdd: function (evt) {

                        var palette = $(evt.item).closest('.ge.ge-palette');

                        if (!palette.length) {
                            $(evt.item).remove();

                            var i = find(self.items, evt.newIndex);

                            var widget = self.$root.$refs.shell.getWidget($(evt.item).data('widget'));

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
        }
    };

    Vue.component('default-stack-page', {
        template: '#default-stack-page',
        mixins: [ Stacked('.wg.wg-table') ],
    });

    Vue.component('default-stack-horisontal', {
        template: '#default-stack-horisontal',
        mixins: [ Core.WidgetMixin, Stacked('.wg.wg-row') ],
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
        mixins: [ Core.WidgetMixin, Stacked('.wg.wg-table') ],
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
