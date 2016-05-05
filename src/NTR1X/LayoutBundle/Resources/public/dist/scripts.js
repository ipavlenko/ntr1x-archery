(function(Vue, $, Core) {

    var ModalEditor =
    Vue.component('bindings-dialog', {

        template: '#bindings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var Editor =
    Vue.component('bindings', {
        mixins: [Core.ActionMixin(ModalEditor)],
    });

})(Vue, jQuery, Core, undefined);

Vue.component('v-form', {

	props: {
		action: String,
		method: String,
		init: Object,
		done: Function,
		fail: Function,
		model: Object,
	},

	// replace: false,

	// template: `
	// 	<form>
	// 		<slot></slot>
	// 	</form>
	// `,

	activate: function(done) {

		this.original = JSON.parse(JSON.stringify(this.model));

		$(this.$el)

			.on('submit', (e) => {
				e.preventDefault();
				this.submit();
			})
			.on('reset', (e) => {
				e.preventDefault();
				this.reset();
			})

		done();
	},

	data: function() {

		return {
			model: this.model
		};
	},

	methods: {

		submit: function() {

			// e.preventDefault();

			// console.log(this.model);

			$.ajax({
				url: this.action,
				method: this.method,
				contentType: "application/json",
				data: JSON.stringify(this.model)
			})
			.done((d) => {
				if (done in this) this.done(d);
			})
			.fail(function(e) { if (fail in this) this.fail(e); }.bind(this))
		},

		reset: function() {
			Object.assign(this.model, this.original);
		}
	},
});
(function($, Vue, undefined) {

	// var model = {
	// 	list: []
	// };
	//
	// var body = Vue.extend({
	// 	created: function()  { this.$dispatch('register-body', this) },
	// });

	Vue.component('grid-table', {

		replace: false,

		props: {
			d: Array
		},

		// data: function() {
		// 	return {
		// 		items: this.d.slice(0)
		// 	}
		// },

		methods: {

			add: function() {
				console.log('asdasd');
				this.items.push({});
				console.log(this.items);
			},

			remove: function(index) {
				this.items.splice(index, 1);
			}
		},
	});

})(jQuery, Vue);

Vue.component('inline-text',
	Vue.extend({
		props: [ 'name', 'value' ],
		template: `
			<div class="inline-container">
				<input class="inline-control" type="text" name="{{ name }}" v-model="value" />
			</div>
		`
	})
);

Vue.component('inline-checkbox',
	Vue.extend({
		props: [ 'name', 'value' ],
		template: `
			<div class="inline-container">
				<input class="inline-checkbox" type="checkbox" name="{{ name }}" v-model="value" />
			</div>
		`
	})
);

Vue.component('inline-select',
	Vue.extend({
		props: [ 'name', 'value', 'options' ],
		template: `
			<div class="inline-container">
				<select class="inline-control1" name="{{ name }}" v-model="value">
					<option v-for="option in options" value="{{ option.key }}">{{ option.value }}</option>
				</select>
			</div>
		`
	})
);

Vue.component('inline-value',
	Vue.extend({
		props: [ 'name', 'value', 'class' ],
		template: `
			<input type="hidden" name="{{ name }}" v-model="value" />
			<span :class="class">{{ value }}</span>
		`
	})
);

Vue.component('modal', {

    props: {
        id: String,
        current: Object,
        original: Object,
    },

    methods: {

        submit: function(e) {
            this.$dispatch('submit', this.current);
            // Object.assign(this.original, JSON.parse(JSON.stringify(this.current)));
            $(e.target).closest('.modal').modal('hide');
        },

        reset: function(e) {
            this.$dispatch('reset', this.current);
            // Object.assign(this.current, JSON.parse(JSON.stringify(this.original)));
            $(e.target).closest('.modal').modal('hide');
        }
    }
});

Vue.directive('combo', {

	bind: function () {

		if ($.fn.tagsinput) {

			$(this.el).select2({
				tags: true,
				multiple: false,
				createTag: function (params) {
					return {
						id: params.term,
						text: params.term,
						newOption: true
					}
				},
			});
		}
	},
	update: function (newValue, oldValue) {
	},
	unbind: function () {
	}
});

Vue.directive('date', {

	bind: function () {
		
		if ($.fn.datepicker) {

			$(this.el).datepicker({
				autoclose: true,
				todayHighlight: true,
				format: "yyyy-mm-dd"
			});
		}
	},
	update: function (newValue, oldValue) {
	},
	unbind: function () {
	}
});

Vue.directive('tags', {

	bind: function () {

		if ($.fn.tagsinput) {

			$(this.el).tagsinput({
			});
		}
	},
	update: function (newValue, oldValue) {
	},
	unbind: function () {
	}
});

(function(Vue, $, Core) {

    var ListViewer =
    Vue.component('domains-list', {
        template: '#domains-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('domains-dialog', {
        template: '#domains-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
    });

    var Editor =
    Vue.component('domains', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#domains',
    });


    var SettingsListViewer =
    Vue.component('domains-settings-list', {
        template: '#domains-settings-list',
        mixins: [Core.ListViewerMixin],
    });

    var SettingsModalEditor =
    Vue.component('domains-settings-dialog', {
        template: '#domains-settings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SettingsEditor =
    Vue.component('domains-settings', {
        mixins: [Core.EditorMixin(SettingsListViewer, SettingsModalEditor)],
        template: '#domains-settings',
    });

})(Vue, jQuery, Core, undefined);

Vue.filter('template', function (string, data) {

	var re = /${([^}]+)}/g;
	return string.replace(re, function(match, key) {
		return data[key];
	});
});

Vue.filter('assign', function (target, source1, source2, source3) {

	return Object.assign(target, source1, source2, source3);
});

Vue.filter('copy', function (source) {

	return new Vue({
		data: source != null
			? JSON.parse(JSON.stringify(source))
			: null
	}).$data;
});

Vue.filter('clone', function (source) {

	return new Vue({
		data: source != null
			? JSON.parse(JSON.stringify(source))
			: null
	}).$data;
});

(function($) {

    $(document).ready(function() {

        function reposition(element) {

            var modal = $(element),
                dialog = $('.modal-dialog', modal);

            modal.css('display', 'block');
            dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
        }

        $($(document), '.modal.modal-center').on('show.bs.modal', function(e) {
            reposition(e.target);
        });

    });

})(jQuery);

(function(Vue, $, Core) {

    var ListViewer =
    Vue.component('pages-list', {
        template: '#pages-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('pages-dialog', {
        template: '#pages-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
    });

    var Editor =
    Vue.component('pages', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#pages',
    });


    var SettingsListViewer =
    Vue.component('pages-settings-list', {
        template: '#pages-settings-list',
        mixins: [Core.ListViewerMixin],
    });

    var SettingsModalEditor =
    Vue.component('pages-settings-dialog', {
        template: '#pages-settings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SettingsEditor =
    Vue.component('pages-settings', {
        mixins: [Core.EditorMixin(SettingsListViewer, SettingsModalEditor)],
        template: '#pages-settings',
    });


    var MetasListViewer =
    Vue.component('pages-metas-list', {
        template: '#pages-metas-list',
        mixins: [Core.ListViewerMixin],
    });

    var MetasModalEditor =
    Vue.component('pages-metas-dialog', {
        template: '#pages-metas-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var MetasEditor =
    Vue.component('pages-metas', {
        mixins: [Core.EditorMixin(MetasListViewer, MetasModalEditor)],
        template: '#pages-metas',
    });

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

    var ListViewer =
    Vue.component('schemes-list', {
        template: '#schemes-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('schemes-dialog', {
        template: '#schemes-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
    });

    var Editor =
    Vue.component('schemes', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#schemes',
    });


    var SettingsListViewer =
    Vue.component('schemes-settings-list', {
        template: '#schemes-settings-list',
        mixins: [Core.ListViewerMixin],
    });

    var SettingsModalEditor =
    Vue.component('schemes-settings-dialog', {
        template: '#schemes-settings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SettingsEditor =
    Vue.component('schemes-settings', {
        mixins: [Core.EditorMixin(SettingsListViewer, SettingsModalEditor)],
        template: '#schemes-settings',
    });

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

    var ModalEditor =
    Vue.component('settings-dialog', {
        template: '#settings-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('domains')],
    });

    var Editor =
    Vue.component('settings', {
        mixins: [Core.ActionMixin(ModalEditor)],
        props: {
            globals: Object
        },
        methods: {
            push: function() {
                $.ajax({
                    url: '/settings/do-update',
                    method: 'POST',
                    dataType: "json",
                    data: JSON.stringify(this.model),
                    contentType: "application/json",
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            pull: function() {
                $.ajax({
                    url: '/settings',
                    method: 'GET',
                    dataType: "json"
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            }
        }
    });

})(Vue, jQuery, Core, undefined);

(function(Vue, $) {

    Vue.component('shell', {
        template: '#shell',
        props: {
            selection: Object,
            settings: Object,
            model: Object,
        },
        data: function() {
            return {
                globals: {
                    selection: this.selection,
                    settings: this.settings,
                    model: this.model,
                    data: this.data,
                },
            };
        },
        ready: function() {

            // TODO Тут игнорируется тот факт, что запись может быть с _action: removed

            if (!this.selection.category) {
                if (this.settings.categories.length > 0) {
                    var sub = this.settings.categories[0];
                    if (sub.categories.length > 0) {
                        this.selection.category = sub.categories[0];
                    }
                }
            }

            if (!this.selection.domain) {
                if (this.model.domains.length > 0) {
                    this.selection.domain = this.model.domains[0];
                    this.selection.page = null;
                    this.selection.source = null;
                }
            }

            if (!this.selection.page) {
                if (this.model.pages.length > 0) {
                    this.selectPage(this.model.pages[0]);
                }
            }

            if (!this.selection.source) {
                if (this.selection.page && this.selection.page.sources.length > 0) {
                    this.selection.source = this.selection.page.sources[0];
                }
            }
        },
        methods: {
            selectPage: function(page) {

                this.selection.page = page;
                this.selection.source = null;

                var data = {};

                // TODO Сделать запросы

                if (page && page.sources) {
                    for (var i = 0; i < page.sources.length; i++) {
                        var s = page.sources[i];
                        data[s.name] = [
                            { one: 11, two: 12 },
                            { one: 21, two: 22 },
                            { one: 31, two: 32 },
                            { one: 41, two: 42 },
                        ];
                    }
                }

                this.globals.data = data;

                console.log(this.globals.data);
            }
        },
        events: {
            pull: function(data) {
                // this.selection.category = data.item;
                console.log('pull');
            },
            push: function(data) {
                console.log('push');
            },
            tree: function(data) {
                console.log(this);
            },
            selectCategory: function(data) {
                this.selection.category = data.item;
            },
            selectDomain: function(data) {
                this.selection.domain = data.item;
            },
            selectPage: function(data) {
                this.selectPage(data.item);
            },
            selectSource: function(data) {
                this.selection.source = data.item;
            },
        }
    });

})(Vue, jQuery, undefined);

(function(Vue, $, Core) {

    var ListViewer =
    Vue.component('widgets-list', {
        template: '#widgets-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('widgets-dialog', {
        template: '#widgets-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var Editor =
    Vue.component('widgets', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#widgets',
    });

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

    var SourcesListViewer =
    Vue.component('pages-sources-list', {
        template: '#pages-sources-list',
        mixins: [Core.ListViewerMixin],
    });

    var SourcesModalEditor =
    Vue.component('pages-sources-dialog', {
        template: '#pages-sources-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            check: function() {
                console.log('check');
            }
        }
    });

    var SourcesEditor =
    Vue.component('pages-sources', {
        mixins: [Core.EditorMixin(SourcesListViewer, SourcesModalEditor)],
        template: '#pages-sources',
    });

    var SourcesParamsListViewer =
    Vue.component('pages-sources-params-list', {
        template: '#pages-sources-params-list',
        mixins: [Core.ListViewerMixin],
    });

    var SourcesParamsModalEditor =
    Vue.component('pages-sources-params-dialog', {
        template: '#pages-sources-params-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SourcesParamsEditor =
    Vue.component('pages-sources-params', {
        mixins: [Core.EditorMixin(SourcesParamsListViewer, SourcesParamsModalEditor)],
        template: '#pages-sources-params',
    });

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

    var WidgetsListViewer =
    Vue.component('pages-widgets-list', {
        template: '#pages-widgets-list',
        mixins: [Core.ListViewerMixin],
        methods: {
            getWidget: function(w) {
                for (var i = 0; i < this.globals.widgets.length; i++) {
                    var widget = this.globals.widgets[i];
                    if (w.type == widget.id) {
                        return widget;
                    }
                }
                return null;
            }
        }
    });

    var WidgetsModalEditor =
    Vue.component('pages-widgets-dialog', {
        template: '#pages-widgets-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
        ready: function() {

            var items = [];

            for (var i = 0; i < this.context.widget.props.length; i++) {

                var prop = this.context.widget.props[i];
                var param = this.current.params[prop.name] = this.current.params[prop.name] || {
                    value: null,
                    binding: null
                };

                param._action = param._action == 'update'
                    ? 'update'
                    : 'create'
                ;

                var item = {
                    prop: prop,
                    param: param,
                };

                items.push(item);
            }

            this.items = items;
        },
        data: function() {
            return {
                context: this.context,
                items: this.items,
            };
        },
        methods: {

            hasProps: function(tab) {
                if (this.context.widget && this.context.widget.props) {
                    for (var i = 0; i < this.context.widget.props.length; i++) {
                        var prop = this.context.widget.props[i];
                        if (prop.tab == tab) return true;
                    }
                }
                return false;
            }
        }
    });

    var WidgetsEditor =
    Vue.component('pages-widgets', {
        mixins: [Core.EditorMixin(WidgetsListViewer, WidgetsModalEditor)],
        template: '#pages-widgets',
        props: {
            widget: Object
        },
        methods: {

            proto: function(widget) {

                var data = {
                    type: widget.id,
                    params: {},
                    resource: {
                        params: [],
                    }
                };

                var params = {};

                for (var i = 0; i < widget.props.length; i++) {

                    var prop = widget.props[i];
                    params[prop.name] = prop.type != 'multiple'
                        ? {
                            _action: 'create',
                            value: null,
                            binding: null,
                        }
                        : {
                            value: [],
                            binding: null,
                        }
                    ;
                }

                data.params = params;

                return data;
            },
        }
    });

})(Vue, jQuery, Core, undefined);

(function($,Vue, undefined) {

    Vue.component('shell-brand', {
        template: '#shell-brand',
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-actions', {
        template: '#shell-actions',
        props: {
            model: Object,
            category: Object,
            domain: Object,
            page: Object
        },
        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-categories', {
        template: '#shell-categories',
        props: {
            categories: Array,
            globals: Object,
        },
        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-container', {
        template: '#shell-container',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            category: Object,
        },
        data: function() {
            console.log(this.globals, this.settings, this.page, this.category);
            // return {
            //     page: this.globals.selection.page
            // }
        },
        // ready: function() {
        //     console.log(this.globals, this.settings, this.page);
        // }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-page', {
        template: '#shell-page',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-pages', {
        template: '#shell-pages',
        props: {
            pages: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    var PaletteItem =
    Vue.component('shell-palette-item', {
        template: '#shell-palette-item',
        props: {
            widget: Object,
            globals: Object,
        },
        computed: {
            thumbnail: function() {
                return '/bundles/' + this.widget.provider.alias + '/' + this.widget.thumbnail.path;
            }
        },
        ready: function() {
            Sortable.create(this.$el, {
                group: {
                    name: 'widgets',
                    pull: 'clone',
                    put: false
                },
                animation: 150,
                sort: false
            });
            // $(this.$el).draggable({
            //     connectToSortable: ".ge.ge-stacked",
            //     helper: "clone",
            //     revert: "invalid"
            // });
        }
    });

    Vue.component('shell-palette', {
        template: '#shell-palette',
        props: {
            category: Object
        },
        components: {
            'palette-item': PaletteItem
        }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

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

(function($,Vue, undefined) {

    Vue.component('shell-stub', {
        template: '#shell-stub',
        props: {
        },
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-target', {
        template: '#shell-target',
        props: {
        },
    });

})(jQuery, Vue);

Shell = window.Shell || {};

(function($, Vue, Shell, undefined) {

    Shell.Widget =
    Vue.component('shell-widget', {
        template: '#shell-widget',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            stack: Object,
            data: Object,
        },
        ready: function() {

            var bindings = null;
            var widget = null;

            // TODO Evaluate

            for (var i = 0; i < this.settings.widgets.length; i++) {
                var w = this.settings.widgets[i];
                if (w.id == this.data.type) {
                    widget = w;
                    break;
                }
            }

            this.bindings = bindings;
            this.widget = widget;
        },
        data: function() {

            return {
                widget: this.widget,
                bindings: this.bindings,
            };
        },
        methods: {
            showSettings: function() {
                this.$dispatch('showSettings', { item: this.data });
            },
            removeWidget: function() {
                this.$dispatch('removeWidget', { item: this.data });
            }
        }
    });

})(jQuery, Vue, Shell);

(function(Vue, $, Core) {

    var ParamString =
    Vue.component('pages-widgets-params-string', {
        template: '#pages-widgets-params-string',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamRich =
    Vue.component('pages-widgets-params-rich', {
        template: '#pages-widgets-params-rich',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamSource =
    Vue.component('pages-widgets-params-source', {
        template: '#pages-widgets-params-source',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamMultiple =
    Vue.component('pages-widgets-params-multiple', {
        template: '#pages-widgets-params-multiple',
        props: {
            id: String,
            item: Object,
            globals: Object,
        },
        data: function() {
            return {
                items: this.item.items
            }
        },
        // ready: function() {
        //     this.items = [];
        // }
    });

    var Params =
    Vue.component('pages-widgets-params', {
        template: '#pages-widgets-params',
        props: {
            owner: Object,
            tab: String,
            items: Array,
            globals: Object
        }
    });


    var ParamMultipleListViewer =
    Vue.component('pages-widgets-params-multiple-list', {
        template: '#pages-widgets-params-multiple-list',
        mixins: [Core.ListViewerMixin],
        props: {
            prop: Object,
            param: Object,
        },
    });

    var ParamMultipleModalEditor =
    Vue.component('pages-widgets-params-multiple-dialog', {
        template: '#pages-widgets-params-multiple-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
        data: function() {
            return {
                items: this.items,
            };
        },
        ready: function() {

            var items = [];

            console.log(this.context);

            for (var i = 0; i < this.context.prop.props.length; i++) {

                var prop = this.context.prop.props[i];
                var param = this.current[prop.name] = this.current[prop.name] || {};

                param._action = param._action == 'update'
                    ? 'update'
                    : 'create'
                ;

                var item = {
                    prop: prop,
                    param: param,
                };

                items.push(item);
            }

            this.items = items;
        },
    });

    var ParamMultipleEditor =
    Vue.component('pages-widgets-params-multiple-editor', {
        mixins: [Core.EditorMixin(ParamMultipleListViewer, ParamMultipleModalEditor)],
        template: '#pages-widgets-params-multiple-editor',
        props: {
            prop: Object,
            param: Object,
            items: Array,
        },
        ready: function() {
            console.log(this);
        }
    });


    var ParamsList =
    Vue.component('pages-widgets-params-list', {
        template: '#pages-widgets-params-list',
        components: {
            'params-string': ParamString,
            'params-rich': ParamRich,
            'params-source': ParamSource,
            'params-multiple': ParamMultiple,
        },
        props: {
            owner: Object,
            tab: String,
            items: Array,
            globals: Object
        }
    });

})(Vue, jQuery, Core, undefined);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJpbmRpbmdzL2JpbmRpbmdzLmpzIiwiY29tcG9uZW50cy9mb3JtLmpzIiwiY29tcG9uZW50cy9ncmlkLmpzIiwiY29tcG9uZW50cy9pbmxpbmUuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImRvbWFpbnMvZG9tYWlucy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJob29rcy9tb2RhbC5qcyIsInBhZ2VzL3BhZ2VzLmpzIiwic2NoZW1lcy9zY2hlbWVzLmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJzaGVsbC9zaGVsbC5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsInBhZ2VzL3NvdXJjZXMvc291cmNlcy5qcyIsInBhZ2VzL3dpZGdldHMvd2lkZ2V0cy5qcyIsInNoZWxsL2JyYW5kL2JyYW5kLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwic2hlbGwvY29udGFpbmVyL2NvbnRhaW5lci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL3BhZ2UvcGFnZS5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RhY2tlZC9zdGFja2VkLmpzIiwic2hlbGwvc3R1Yi9zdHViLmpzIiwic2hlbGwvdGFyZ2V0L3RhcmdldC5qcyIsInNoZWxsL3dpZGdldC93aWRnZXQuanMiLCJwYWdlcy93aWRnZXRzL3BhcmFtcy9wYXJhbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzLWRpYWxvZycsIHtcclxuXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XHJcblxyXG5cdHByb3BzOiB7XHJcblx0XHRhY3Rpb246IFN0cmluZyxcclxuXHRcdG1ldGhvZDogU3RyaW5nLFxyXG5cdFx0aW5pdDogT2JqZWN0LFxyXG5cdFx0ZG9uZTogRnVuY3Rpb24sXHJcblx0XHRmYWlsOiBGdW5jdGlvbixcclxuXHRcdG1vZGVsOiBPYmplY3QsXHJcblx0fSxcclxuXHJcblx0Ly8gcmVwbGFjZTogZmFsc2UsXHJcblxyXG5cdC8vIHRlbXBsYXRlOiBgXHJcblx0Ly8gXHQ8Zm9ybT5cclxuXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxyXG5cdC8vIFx0PC9mb3JtPlxyXG5cdC8vIGAsXHJcblxyXG5cdGFjdGl2YXRlOiBmdW5jdGlvbihkb25lKSB7XHJcblxyXG5cdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xyXG5cclxuXHRcdCQodGhpcy4kZWwpXHJcblxyXG5cdFx0XHQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHRoaXMuc3VibWl0KCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5vbigncmVzZXQnLCAoZSkgPT4ge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0ZG9uZSgpO1xyXG5cdH0sXHJcblxyXG5cdGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHJcblx0XHRzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XHJcblxyXG5cdFx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHVybDogdGhpcy5hY3Rpb24sXHJcblx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcclxuXHRcdFx0XHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcblx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbClcclxuXHRcdFx0fSlcclxuXHRcdFx0LmRvbmUoKGQpID0+IHtcclxuXHRcdFx0XHRpZiAoZG9uZSBpbiB0aGlzKSB0aGlzLmRvbmUoZCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5mYWlsKGZ1bmN0aW9uKGUpIHsgaWYgKGZhaWwgaW4gdGhpcykgdGhpcy5mYWlsKGUpOyB9LmJpbmQodGhpcykpXHJcblx0XHR9LFxyXG5cclxuXHRcdHJlc2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCB0aGlzLm9yaWdpbmFsKTtcclxuXHRcdH1cclxuXHR9LFxyXG59KTsiLCIoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcblx0Ly8gdmFyIG1vZGVsID0ge1xyXG5cdC8vIFx0bGlzdDogW11cclxuXHQvLyB9O1xyXG5cdC8vXHJcblx0Ly8gdmFyIGJvZHkgPSBWdWUuZXh0ZW5kKHtcclxuXHQvLyBcdGNyZWF0ZWQ6IGZ1bmN0aW9uKCkgIHsgdGhpcy4kZGlzcGF0Y2goJ3JlZ2lzdGVyLWJvZHknLCB0aGlzKSB9LFxyXG5cdC8vIH0pO1xyXG5cclxuXHRWdWUuY29tcG9uZW50KCdncmlkLXRhYmxlJywge1xyXG5cclxuXHRcdHJlcGxhY2U6IGZhbHNlLFxyXG5cclxuXHRcdHByb3BzOiB7XHJcblx0XHRcdGQ6IEFycmF5XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gXHRyZXR1cm4ge1xyXG5cdFx0Ly8gXHRcdGl0ZW1zOiB0aGlzLmQuc2xpY2UoMClcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gfSxcclxuXHJcblx0XHRtZXRob2RzOiB7XHJcblxyXG5cdFx0XHRhZGQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcclxuXHRcdFx0XHR0aGlzLml0ZW1zLnB1c2goe30pO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuaXRlbXMpO1xyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHRcdHRoaXMuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHR9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiVnVlLmNvbXBvbmVudCgnaW5saW5lLXRleHQnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jb250cm9sXCIgdHlwZT1cInRleHRcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtY2hlY2tib3gnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnb3B0aW9ucycgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PHNlbGVjdCBjbGFzcz1cImlubGluZS1jb250cm9sMVwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCI+XHJcblx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cclxuXHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS12YWx1ZScsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xyXG5cclxuICAgIHByb3BzOiB7XHJcbiAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICBjdXJyZW50OiBPYmplY3QsXHJcbiAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcclxuICAgIH0sXHJcblxyXG4gICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcclxuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCdjb21ibycsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS5zZWxlY3QyKHtcclxuXHRcdFx0XHR0YWdzOiB0cnVlLFxyXG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcclxuXHRcdFx0XHRjcmVhdGVUYWc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdGlkOiBwYXJhbXMudGVybSxcclxuXHRcdFx0XHRcdFx0dGV4dDogcGFyYW1zLnRlcm0sXHJcblx0XHRcdFx0XHRcdG5ld09wdGlvbjogdHJ1ZVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcclxuXHRcdGlmICgkLmZuLmRhdGVwaWNrZXIpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XHJcblx0XHRcdFx0YXV0b2Nsb3NlOiB0cnVlLFxyXG5cdFx0XHRcdHRvZGF5SGlnaGxpZ2h0OiB0cnVlLFxyXG5cdFx0XHRcdGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3RhZ3MnLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkudGFnc2lucHV0KHtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiVnVlLmZpbHRlcigndGVtcGxhdGUnLCBmdW5jdGlvbiAoc3RyaW5nLCBkYXRhKSB7XHJcblxyXG5cdHZhciByZSA9IC8keyhbXn1dKyl9L2c7XHJcblx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlLCBmdW5jdGlvbihtYXRjaCwga2V5KSB7XHJcblx0XHRyZXR1cm4gZGF0YVtrZXldO1xyXG5cdH0pO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2Fzc2lnbicsIGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpIHtcclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuXHRyZXR1cm4gbmV3IFZ1ZSh7XHJcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxyXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuXHRcdFx0OiBudWxsXHJcblx0fSkuJGRhdGE7XHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVnVlKHtcclxuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG5cdFx0XHQ6IG51bGxcclxuXHR9KS4kZGF0YTtcclxufSk7XHJcbiIsIihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBNZXRhc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTWV0YXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1ldGFzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcycsXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzZXR0aW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RvbWFpbnMnKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncy9kby11cGRhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzZWxlY3Rpb246IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbjogdGhpcy5zZWxlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcblxyXG4gICAgICAgICAgICAvLyBUT0RPINCi0YPRgiDQuNCz0L3QvtGA0LjRgNGD0LXRgtGB0Y8g0YLQvtGCINGE0LDQutGCLCDRh9GC0L4g0LfQsNC/0LjRgdGMINC80L7QttC10YIg0LHRi9GC0Ywg0YEgX2FjdGlvbjogcmVtb3ZlZFxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuY2F0ZWdvcmllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YiA9IHRoaXMuc2V0dGluZ3MuY2F0ZWdvcmllc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViLmNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IHN1Yi5jYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5kb21haW4pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmRvbWFpbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmRvbWFpbiA9IHRoaXMubW9kZWwuZG9tYWluc1swXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5zb3VyY2UgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0aW9uLnBhZ2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLnBhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBhZ2UodGhpcy5tb2RlbC5wYWdlc1swXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3Rpb24uc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb24ucGFnZSAmJiB0aGlzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IHRoaXMuc2VsZWN0aW9uLnBhZ2Uuc291cmNlc1swXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzZWxlY3RQYWdlOiBmdW5jdGlvbihwYWdlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24ucGFnZSA9IHBhZ2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5zb3VyY2UgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyDQodC00LXQu9Cw0YLRjCDQt9Cw0L/RgNC+0YHRi1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2Uuc291cmNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFnZS5zb3VyY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzID0gcGFnZS5zb3VyY2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3MubmFtZV0gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMTEsIHR3bzogMTIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgb25lOiAyMSwgdHdvOiAyMiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBvbmU6IDMxLCB0d286IDMyIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogNDEsIHR3bzogNDIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLmRhdGEgPSBkYXRhO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscy5kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1bGwnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1c2gnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJlZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5OiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5kb21haW4gPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGFnZShkYXRhLml0ZW0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgU291cmNlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgV2lkZ2V0c0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZ2V0V2lkZ2V0OiBmdW5jdGlvbih3KSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2xvYmFscy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZGdldCA9IHRoaXMuZ2xvYmFscy53aWRnZXRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3LnR5cGUgPT0gd2lkZ2V0LmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgV2lkZ2V0c01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50LnBhcmFtc1twcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50LnBhcmFtc1twcm9wLm5hbWVdIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGhhc1Byb3BzOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgV2lkZ2V0c0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oV2lkZ2V0c0xpc3RWaWV3ZXIsIFdpZGdldHNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBwcm90bzogZnVuY3Rpb24od2lkZ2V0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHdpZGdldC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbcHJvcC5uYW1lXSA9IHByb3AudHlwZSAhPSAnbXVsdGlwbGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRhdGEucGFyYW1zID0gcGFyYW1zO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYWN0aW9ucycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1hY3Rpb25zJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkb21haW46IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY2F0ZWdvcmllcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtY29udGFpbmVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNvbnRhaW5lcicsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5nbG9iYWxzLCB0aGlzLnNldHRpbmdzLCB0aGlzLnBhZ2UsIHRoaXMuY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICAvLyByZXR1cm4ge1xyXG4gICAgICAgICAgICAvLyAgICAgcGFnZTogdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlXHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2codGhpcy5nbG9iYWxzLCB0aGlzLnNldHRpbmdzLCB0aGlzLnBhZ2UpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRvbWFpbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZG9tYWlucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZG9tYWluczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFnZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHBhZ2VzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICB2YXIgUGFsZXR0ZUl0ZW0gPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZS1pdGVtJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUtaXRlbScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgICAgIHRodW1ibmFpbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJy9idW5kbGVzLycgKyB0aGlzLndpZGdldC5wcm92aWRlci5hbGlhcyArICcvJyArIHRoaXMud2lkZ2V0LnRodW1ibmFpbC5wYXRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSh0aGlzLiRlbCwge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXA6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgcHVsbDogJ2Nsb25lJyxcclxuICAgICAgICAgICAgICAgICAgICBwdXQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gJCh0aGlzLiRlbCkuZHJhZ2dhYmxlKHtcclxuICAgICAgICAgICAgLy8gICAgIGNvbm5lY3RUb1NvcnRhYmxlOiBcIi5nZS5nZS1zdGFja2VkXCIsXHJcbiAgICAgICAgICAgIC8vICAgICBoZWxwZXI6IFwiY2xvbmVcIixcclxuICAgICAgICAgICAgLy8gICAgIHJldmVydDogXCJpbnZhbGlkXCJcclxuICAgICAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgICAgICAgICdwYWxldHRlLWl0ZW0nOiBQYWxldHRlSXRlbVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc291cmNlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gZmluZChpdGVtcywgZG9tSW5kZXgpIHtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICB2YXIgaXRlbSA9IG51bGw7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoICYmIGluZGV4IDwgZG9tSW5kZXg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgaXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RhY2tlZCcsIHtcclxuXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc3RhY2tlZCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSh0aGlzLiRlbCwge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXA6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcblxyXG4gICAgICAgICAgICAgICAgb25BZGQ6IGZ1bmN0aW9uIChldnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChldnQuaXRlbSkucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShpLmluZGV4LCAwLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICQoZXZ0Lml0ZW0pLmRhdGEoJ3dpZGdldCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHNlbGYuaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBvbkVuZDogZnVuY3Rpb24gKGV2dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGV2dC5pdGVtKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgIChldnQubmV3SW5kZXggIT0gZXZ0Lm9sZEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gZmluZChzZWxmLml0ZW1zLCBldnQub2xkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaS5pbmRleCwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2kuaW5kZXgsIDEpWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHNlbGYuaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxuICAgICAgICBldmVudHM6IHtcblxuICAgICAgICAgICAgcmVtb3ZlV2lkZ2V0OiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoZGF0YS5pdGVtKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpO1xyXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0dWInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc3R1YicsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtdGFyZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXRhcmdldCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFNoZWxsLldpZGdldCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC13aWRnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtd2lkZ2V0JyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHdpZGdldCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPIEV2YWx1YXRlXHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0dGluZ3Mud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHcgPSB0aGlzLnNldHRpbmdzLndpZGdldHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAody5pZCA9PSB0aGlzLmRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZGdldCA9IHc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYmluZGluZ3MgPSBiaW5kaW5ncztcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQgPSB3aWRnZXQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0LFxyXG4gICAgICAgICAgICAgICAgYmluZGluZ3M6IHRoaXMuYmluZGluZ3MsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNob3dTZXR0aW5nczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgnc2hvd1NldHRpbmdzJywgeyBpdGVtOiB0aGlzLmRhdGEgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlV2lkZ2V0JywgeyBpdGVtOiB0aGlzLmRhdGEgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgUGFyYW1TdHJpbmcgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtc3RyaW5nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLXN0cmluZycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtUmljaCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1yaWNoJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLXJpY2gnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbVNvdXJjZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1zb3VyY2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtc291cmNlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW0uaXRlbXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vICAgICB0aGlzLml0ZW1zID0gW107XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtcyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgb3duZXI6IE9iamVjdCxcclxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQucHJvcC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1lZGl0b3InLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihQYXJhbU11bHRpcGxlTGlzdFZpZXdlciwgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZWRpdG9yJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBQYXJhbXNMaXN0ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbGlzdCcsXHJcbiAgICAgICAgY29tcG9uZW50czoge1xyXG4gICAgICAgICAgICAncGFyYW1zLXN0cmluZyc6IFBhcmFtU3RyaW5nLFxyXG4gICAgICAgICAgICAncGFyYW1zLXJpY2gnOiBQYXJhbVJpY2gsXHJcbiAgICAgICAgICAgICdwYXJhbXMtc291cmNlJzogUGFyYW1Tb3VyY2UsXHJcbiAgICAgICAgICAgICdwYXJhbXMtbXVsdGlwbGUnOiBQYXJhbU11bHRpcGxlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgb3duZXI6IE9iamVjdCxcclxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
