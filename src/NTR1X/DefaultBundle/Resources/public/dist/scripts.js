(function($, Vue, Core) {

    Vue.component('default-footer', {
        template: '#default-footer',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-header', {
        template: '#default-header',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-menu', {
        template: '#default-menu',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-placeholder', {
        template: '#default-placeholder',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-sitemap', {
        template: '#default-sitemap',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvb3Rlci9mb290ZXIuanMiLCJoZWFkZXIvaGVhZGVyLmpzIiwibWVudS9tZW51LmpzIiwicGxhY2Vob2xkZXIvcGxhY2Vob2xkZXIuanMiLCJzaXRlbWFwL3NpdGVtYXAuanMiLCJzdGFjay9zdGFjay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1mb290ZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZm9vdGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1oZWFkZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaGVhZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1tZW51Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LW1lbnUnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXBsYWNlaG9sZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zaXRlbWFwJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXNpdGVtYXAnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xuXG4gICAgZnVuY3Rpb24gZmluZChpdGVtcywgZG9tSW5kZXgpIHtcblxuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB2YXIgaXRlbSA9IG51bGw7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGggJiYgaW5kZXggPCBkb21JbmRleDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtc1tpXTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgU3RhY2tlZCA9IHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUoJCgnLndnLndnLXRhYmxlJywgdGhpcy4kZWwpLmdldCgwKSwge1xuICAgICAgICAgICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3aWRnZXRzJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxuXG4gICAgICAgICAgICAgICAgb25BZGQ6IGZ1bmN0aW9uIChldnQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFsZXR0ZSA9ICQoZXZ0Lml0ZW0pLmNsb3Nlc3QoJy5nZS5nZS1wYWxldHRlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWxldHRlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChldnQuaXRlbSkucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gU2hlbGwuU2VydmljZXMuTGF5b3V0LmdldFdpZGdldCgkKGV2dC5pdGVtKS5kYXRhKCd3aWRnZXQnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMuc3BsaWNlKGkuaW5kZXgsIDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogd2lkZ2V0LnBhcmFtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2lkZ2V0LnBhcmFtcykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCBzZWxmLml0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBvbkVuZDogZnVuY3Rpb24gKGV2dCkge1xuXG4gICAgICAgICAgICAgICAgICAgICQoZXZ0Lml0ZW0pLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICAoZXZ0Lm5ld0luZGV4ICE9IGV2dC5vbGRJbmRleCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gZmluZChzZWxmLml0ZW1zLCBldnQub2xkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaS5pbmRleCwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2kuaW5kZXgsIDEpWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgc2VsZi5pdGVtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50czoge1xuXG4gICAgICAgICAgICByZW1vdmVXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihkYXRhLml0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1wYWdlJyxcbiAgICAgICAgbWl4aW5zOiBbIFN0YWNrZWQgXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIFN0YWNrZWQgXSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBTdGFja2VkIF0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtc1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
