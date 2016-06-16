
(function($, Vue, Core, Shell, undefined) {

    $(document).ready(function() {

        $('[data-vue-public]').each(function(index, element) {

            var data = $(element).data();

            var App = Vue.extend({
                data: function() {
                    return data;
                },
                created: function() {

                    Vue.service('security', Core.SecurityFactory(this));
                    Vue.service('portals', Core.PortalsFactory(this));
                },
            });

            var router = new VueRouter({
                history: true,
            });

            router.beforeEach(function(transition) {

                if (transition.to.auth && !router.app.principal) {
                    transition.abort();
                } else if (transition.to.anon && router.app.principal) {
                    transition.abort();
                } else {
                    transition.next();
                }
            });

            var routes = {
                '/': {
                    component: Landing.LandingPage,
                },
                '/gallery': {
                    component: Landing.LandingGalleryPage,
                },
                '/storage': {
                    component: Landing.LandingStoragePage,
                },
                '/signin': {
                    component: Landing.LandingSigninPage,
                    anon: true,
                },
                '/signup': {
                    component: Landing.LandingSignupPage,
                    anon: true,
                },
                '/manage': {
                    component: Landing.LandingManagePage,
                    auth: true,
                },
                '/manage-create': {
                    component: Landing.LandingManageCreatePage,
                    auth: true,
                },
                '/site/:domain/:page': {
                    component: Shell.ShellPublic,
                    auth: true,
                },
                '/manage/:domain': {
                    component: Shell.Loader,
                    auth: true,
                },
                '/manage/:domain/:page': {
                    component: Shell.Loader,
                    auth: true,
                },
            };

            function createRoute(page) {
                return {
                    component: Shell.ShellPublic.extend({
                        data: function() {
                            return {
                                page: page,
                            };
                        }
                    }),
                };
            }

            if (data.model) {
                for (var i = 0; i < data.model.pages.length; i++) {

                    var page = data.model.pages[i];
                    routes[page.name] = createRoute(page);
                }
            }

            router.map(routes);

            router.start(App, $('[data-vue-body]', element).get(0));
        })
    });

})(jQuery, Vue, Core, Shell);

(function(Vue, $, Core) {

    var ModalEditor =
    Vue.component('bindings-dialog', {
        template: '#bindings-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            setStrategy: function(strategy) {
                this.$set('current.binding.strategy', strategy);
            },
            getStrategy: function(strategy) {
                return this.$get('current.binding.strategy');
            },
        },
        created: function() {
            if (!this.current.binding) this.current.binding = {};
        },
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

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.LandingPage =
    Vue.component('landing-page', {
        template: '#landing-page',
    });

    Landing.LandingGalleryPage =
    Vue.component('landing-gallery-page', {
        template: '#landing-gallery-page',
    });

    Landing.LandingStoragePage =
    Vue.component('landing-storage-page', {
        template: '#landing-storage-page',
    });

    Landing.LandingSigninPage =
    Vue.component('landing-signin-page', {
        template: '#landing-signin-page',
    });

    Landing.LandingSignupPage =
    Vue.component('landing-signup-page', {
        template: '#landing-signup-page',
    });

    Landing.LandingProfilePage =
    Vue.component('landing-profile-page', {
        template: '#landing-profile-page',
    });

    Landing.LandingManagePage =
    Vue.component('landing-manage-page', {
        template: '#landing-manage-page',
    });

    Landing.LandingManageCreatePage =
    Vue.component('landing-manage-create-page', {
        template: '#landing-manage-create-page',
    });

})(Vue, jQuery, Landing);

(function(Vue, $, Core) {

    var ParamString =
    Vue.component('params-string', {
        template: '#params-string',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamRich =
    Vue.component('params-rich', {
        template: '#params-rich',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamSource =
    Vue.component('params-source', {
        template: '#params-source',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamMultiple =
    Vue.component('params-multiple', {
        template: '#params-multiple',
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
    });

    var Params =
    Vue.component('params', {
        template: '#params',
        props: {
            owner: Object,
            tab: String,
            items: Array,
            globals: Object
        }
    });


    var ParamMultipleListViewer =
    Vue.component('params-multiple-list', {
        template: '#params-multiple-list',
        mixins: [Core.ListViewerMixin],
        props: {
            prop: Object,
            param: Object,
        },
        methods: {
            getLabel: function(item) {

                if (this.prop.display) {
                    var vm = new Vue({
                        item: item,
                    });
                    return vm.$interpolate(this.prop.display);
                }
                return '<item>';
            },
        }
    });

    var ParamBindingsModalEditor =
    Vue.component('params-bindings-dialog', {
        template: '#params-bindings-dialog',
        mixins: [ Core.ModalEditorMixin, Core.TabsMixin('binding') ],
        data: function() {
            return {
                items: this.items,
            };
        },
        created: function() {

            var items = [];

            var binding = this.current.binding || {};
            if (!binding.strategy) binding.strategy = 'interpolate';

            binding.params = binding.params || {};

            if (this.context.prop.props) {
                for (var i = 0; i < this.context.prop.props.length; i++) {

                    var prop = this.context.prop.props[i];
                    var param = binding.params[prop.name] = binding.params[prop.name] || {};

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
            }

            this.$set('current.binding', binding);
            this.$set('items', items);
        },
        methods: {
            setStrategy: function(strategy) {
                this.$set('current.binding.strategy', strategy);
            },
            getStrategy: function(strategy) {
                return this.$get('current.binding.strategy');
            },
        },
    });

    var Editor =
    Vue.component('params-bindings', {
        mixins: [Core.ActionMixin(ParamBindingsModalEditor)],
    });

    var ParamMultipleModalEditor =
    Vue.component('params-multiple-dialog', {
        template: '#params-multiple-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('data')],
        data: function() {
            return {
                items: this.items,
            };
        },
        created: function() {

            var items = [];

            console.log('created', ParamMultipleModalEditor);

            for (var i = 0; i < this.context.prop.props.length; i++) {

                var prop = this.context.prop.props[i];
                var param = this.current[prop.name] = this.current[prop.name] || { value: null };

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

            this.$set('items', items);
        },
    });

    var ParamMultipleEditor =
    Vue.component('params-multiple-editor', {
        mixins: [Core.EditorMixin(ParamMultipleListViewer, ParamMultipleModalEditor)],
        template: '#params-multiple-editor',
        props: {
            prop: Object,
            param: Object,
            items: Array,
        },
    });


    var ParamsList =
    Vue.component('params-list', {
        template: '#params-list',
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

Core = window.Core || {};

(function($, Vue, Core, undefined) {

    Core.PortalsFactory = function(owner) {

        return {

            load: (data) => new Promise((resolve, reject) => {

                owner.$http.get('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            create: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            remove: (data) => new Promise((resolve, reject) => {

                owner.$http.delete('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            settings: (data) => new Promise((resolve, reject) => {

                owner.$http.delete('/ws/settings', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),
        };
    }

})(jQuery, Vue, Core);

Core = window.Core || {};

(function($, Vue, Core, undefined) {

    Core.SecurityFactory = function(owner) {

        return {

            signup: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/signup', data).then(
                    (d) => { owner.principal = d.data.principal; resolve(d); },
                    (e) => { owner.principal = null; reject(e); }
                );
            }),

            signin: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/signin', data).then(
                    (d) => { owner.principal = d.data.principal; resolve(d); },
                    (e) => { owner.principal = null; reject(e); }
                );
            }),

            signout: () => new Promise((resolve, reject) => {

                owner.$http.post('/ws/signout').then(
                    (d) => { owner.principal = null; resolve(d); },
                    (e) => { reject(e); }
                );
            }),
        };
    }

})(jQuery, Vue, Core);

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

(function(Vue, $, Core) {

    var StoragesListViewer =
    Vue.component('storages-list', {
        template: '#storages-list',
        mixins: [Core.ListViewerMixin],
    });

    var StoragesModalEditor =
    Vue.component('storages-dialog', {
        template: '#storages-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            check: function() {
                console.log('check');
            }
        }
    });

    var StoragesEditor =
    Vue.component('storages', {
        mixins: [Core.EditorMixin(StoragesListViewer, StoragesModalEditor)],
        template: '#storages',
    });

    var StoragesVariablesListViewer =
    Vue.component('storages-variables-list', {
        template: '#storages-variables-list',
        mixins: [Core.ListViewerMixin],
    });

    var StoragesVariablesModalEditor =
    Vue.component('storages-variables-dialog', {
        template: '#storages-variables-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var StoragesVariablesEditor =
    Vue.component('storages-variables', {
        mixins: [Core.EditorMixin(StoragesVariablesListViewer, StoragesVariablesModalEditor)],
        template: '#storages-variables',
    });

})(Vue, jQuery, Core, undefined);

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

Shell = window.Shell || {};
Shell.Widgets = window.Shell.Widgets || {};

(function(Vue, $, Core, Shell, undefined) {

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

    var WidgetsModalEditor = Shell.Widgets.ModalEditor =
    Vue.component('pages-widgets-dialog', {
        template: '#pages-widgets-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('data')],
        created: function() {

            var items = [];

            for (var i = 0; i < this.context.widget.props.length; i++) {

                var prop = this.context.widget.props[i];

                // TODO Move to service layer
                var param = this.current.params[prop.name] = this.current.params[prop.name] || {
                    _action: 'create',
                    value: (prop.type == 'multiple' ? [] : null),
                    binding: {
                        strategy: null,
                        expression: null,
                        params: (prop.type == 'multiple' ? null : undefined),
                    },
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
                    // TODO Move to service layer
                    params[prop.name] = {
                        _action: 'create',
                        value: (prop.type == 'multiple' ? [] : null),
                        binding: {
                            strategy: null,
                            expression: null,
                            params: (prop.type == 'multiple' ? null : undefined),
                        },
                    };
                }

                data.params = params;

                return data;
            },
        }
    });

})(Vue, jQuery, Core, Shell, undefined);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    var validation = {
        email: "/^([a-zA-Z0-9_\\.\\-]+)@([a-zA-Z0-9_\\.\\-]+)\\.([a-zA-Z0-9]{2,})$/g",
    };

    Landing.Signin =
    Vue.component('landing-account-signin', {
        template: '#landing-account-signin',
        data: function() {
            return {
                form: this.form,
                validation: validation,
            }
        },
        created: function() {
            this.$set('form', {
                email: null,
                password: null,
            });
        },
        methods: {
            signin: function() {

                Vue.service('security').signin({
                    email: this.form.email,
                    password: this.form.password,
                }).then(
                    (d) => { this.$router.go('/'); },
                    (e) => { }
                );
            }
        },
    });

    Landing.Signup =
    Vue.component('landing-account-signup', {
        template: '#landing-account-signup',
        data: function() {
            return {
                form: this.form,
                validation: validation,
            }
        },
        created: function() {
            this.$set('form', {
                email: null,
                password: null,
            });
        },
        methods: {
            signup: function() {

                Vue.service('security').signup({
                    email: this.form.email,
                    password: this.form.password,
                }).then(
                    (d) => { this.$router.go('/'); },
                    (e) => { }
                );
            }
        },
    });

    Landing.Profile =
    Vue.component('landing-account-profile', {
        template: '#landing-account-profile',
    });

})(Vue, jQuery, Landing);



Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Footer =
    Vue.component('landing-footer', {
        template: '#landing-footer',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Feedback =
    Vue.component('landing-feedback', {
        template: '#landing-feedback',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Gallery =
    Vue.component('landing-gallery', {
        template: '#landing-gallery',
    });

    Landing.GalleryFull =
    Vue.component('landing-gallery-full', {
        template: '#landing-gallery-full',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Header =
    Vue.component('landing-header', {
        template: '#landing-header',
        methods: {
            signout: function() {
                Vue.service('security').signout().then(
                    (d) => { this.$router.go('/'); },
                    (e) => { }
                );
            }
        },
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Manage =
    Vue.component('landing-manage', {

        template: '#landing-manage',
        data: function() {
            return {
                url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: ''),
                portals: this.portals,
            };
        },
        created: function() {
            this.refresh();
        },
        methods: {

            refresh: function() {
                Vue.service('portals').load().then(
                    (d) => { this.$set('portals', d.data.portals); },
                    (e) => { this.$set('portals', []); }
                );
            },

            remove: function(id) {
                Vue.service('portals').remove({
                    id: id,
                })
                .then(
                    (d) => { this.refresh(); },
                    (e) => { }
                );
            },
        }
    });

    Landing.ManageCreate =
    Vue.component('landing-manage-create', {
        template: '#landing-manage-create',
        data: function() {
            return {
                form: this.form,
            }
        },
        created: function() {
            this.$set('form', {
                title: null,
            });
        },
        methods: {

            create: function() {
                Vue.service('portals').create({
                    title: this.form.title,
                })
                .then(
                    (d) => { this.$router.go('/manage')},
                    (e) => { }
                );
            },
        }
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Storage =
    Vue.component('landing-pricing', {
        template: '#landing-pricing',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Storage =
    Vue.component('landing-storage', {
        template: '#landing-storage',
    });

    Landing.StorageFull =
    Vue.component('landing-storage-full', {
        template: '#landing-storage-full',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Usecases =
    Vue.component('landing-usecases', {
        template: '#landing-usecases',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Super =
    Vue.component('landing-super', {
        template: '#landing-super',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Video =
    Vue.component('landing-video', {
        template: '#landing-video',
    });

})(Vue, jQuery, Landing);

(function($,Vue, undefined) {

    var scale = 1;

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
            zoom: function(event) {
                scale += (event == 'in') ? 0.1 : -0.1;
                $('.ge.ge-page').css('transform', 'scale(' + scale + ')');
            },
        }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-brand', {
        template: '#shell-brand',
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
        // data: function() {
            // console.log(this.globals, this.settings, this.page, this.category);
            // return {
            //     page: this.globals.selection.page
            // }
        // },
        // ready: function() {
        //     console.log(this.globals, this.settings, this.page);
        // }
    });

})(jQuery, Vue);

Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {

    var runtime = Vue.service('runtime', {

        evaluate: function(self, b, v) {

            if (b && b.expression) {

                try {
                    if (b.strategy == 'eval') {
                        var value = self.$eval(b.expression);
                        return value;
                    } else if (b.strategy == 'wire') {
                        var value = self.$get(b.expression);
                        // console.log('value', value, b);
                        return value;
                    } else {
                        return self.$interpolate(b.expression);
                    }
                } catch (e) {
                    console.log('Cannot evaluate expression', b.expression);
                    return v;
                }
            }

            return v;
        },

        evaluateParams: function(self, props, params) {

            var items = [];
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var param = params && params[prop.name];
                items.push({
                    prop: prop,
                    param: param || {},
                });
            }

            var value = {};
            for (var i = 0; i < items.length; i++) {

                var item = items[i];

                var n = item.prop.name;
                var r = item.prop.variable;
                var b = item.param.binding;
                var v = item.param.value;

                if (item.prop.type == 'object') {
                    // TODO Implement
                } else if (item.prop.type == 'multiple') {

                    if (b && b.expression) {

                        var vv = null;

                        var array = [];
                        var result = runtime.evaluate(self, b, v);

                        if (r) {
                            vv = result;
                        } else {

                            if ($.isArray(result)) {

                                for (var j = 0; j < result.length; j++) {

                                    var vm = new Vue({
                                        data: Object.assign(JSON.parse(JSON.stringify(self.$data)), {
                                            item: {
                                                index: j,
                                                value: result[j],
                                            }
                                        })
                                    });

                                    array.push(this.evaluateParams(vm, item.prop.props, b.params));
                                }

                                vv = array;
                            }
                        }

                    } else {

                        var array = [];

                        var index = 0;
                        for(var j = 0; j < v.length; j++) {
                            var vi = v[j];
                            if (vi._action != 'remove') {
                                array[index++] = this.evaluateParams(self, item.prop.props, vi);
                            }
                        }

                        vv = r ? { value: array } : array;
                    }

                    value[n] = vv;

                } else {

                    var vv = runtime.evaluate(self, b, v);
                    value[n] = vv;
                }
            }

            // console.log(value);
            return value;
        }
    });

    function stub(title, subtitle) {
        return {
            type: 'NTR1XDefaultBundle/Stub',
            _action: 'ignore',
            params: {
                title: { value: title },
                subtitle: { value: subtitle }
            }
        }
    }

    var DecoratorMixin = {

        props: {
            items: Array,
        },

        methods: {

            removeWidget: function() {
                this.$dispatch('removeChildWidget', { item: this.model });
            },

            doApply: function(model) {

                Object.assign(this.model, JSON.parse(JSON.stringify(model)), {
                    _action: this.model._action
                        ? this.model._action
                        : 'update'
                });

                $(window).trigger('resize');
            },

            showSettings: function() {

                var dialog = new Shell.Widgets.ModalEditor({

                    data: {
                        globals: this.globals,
                        owner: this,
                        context: {
                            widget: this.widget
                        },
                        original: this.model,
                        current: JSON.parse(JSON.stringify(this.model))
                    },

                    methods: {
                        submit: function() {
                            this.owner.doApply(this.current);
                            this.$remove();
                            this.$destroy();
                        },
                        reset: function() {
                            this.$remove();
                            this.$destroy();
                        }
                    }
                }).$mount().$appendTo($('body').get(0));
            },
        },
    };

    var BindingsMixin = {

        data: function() {
            return {
                bindings: this.bindings,
            };
        },

        created: function() {

            this.$watch('data', (data) => {
                var bindings = runtime.evaluateParams(this, this.widget.props, this.model.params);
                this.$set('bindings', bindings);
            }, {
                deep: true,
                immediate: true,
            });

            this.$watch('storage', (storage) => {
                var bindings = runtime.evaluateParams(this, this.widget.props, this.model.params);
                this.$set('bindings', bindings);
            }, {
                deep: true,
                immediate: true,
            });

            this.$watch('model', (model) => {
                var bindings = runtime.evaluateParams(this, this.widget.props, model.params)
                this.$set('bindings', bindings);
            }, {
                deep: true,
                immediate: true,
            });
        }
    };

    var CompositeMixin = {

        data: function() {
            return {
                children: this.children,
            };
        },

        created: function() {

            this.$watch('items', (items) => {

                var children = [];
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (item._action != 'remove') {
                            children.push(item);
                        }
                    }
                }

                if (children.length < 1) {
                    children.push(JSON.parse(JSON.stringify(this.stub())));
                }

                this.children = children;
            }, {
                immediate: true,
                deep: true,
            });
        },

        events: {

            removeChildWidget: function(data) {

                var item = data.item;

                if (item._action == 'create') {
                    this.items.$remove(item);
                } else {
                    item._action = 'remove';
                }

                this.items = this.items.slice();
            },
        },
    };

    var SortableMixin = function (selector) {

        function find(children, domIndex) {

            var index = 0;
            for (var i = 0; i < children.length && index < domIndex; i++) {

                var child = children[i];

                if (child._action != 'remove') {
                    index++;
                }
            }

            return index;
        }

        return {

            data: function() {

                return {
                    selected: this.selected,
                };
            },

            created: function() {

                if (this.$route.private) {

                    var shell = Vue.service('shell');

                    var self = this;
                    this.$watch('selected', function(selected) {

                        if (selected) {

                            self.sortable =
                            Sortable.create($(selector, self.$el).get(0), {

                                group: {
                                    name: 'widgets',
                                    pull: 'clone',
                                },
                                animation: 150,

                                onAdd: function (evt) {

                                    var palette = $(evt.item).closest('.ge.ge-palette');

                                    var w = $(evt.item).data('widget');

                                    if (w) {

                                        if (!palette.length) {

                                            $(evt.item).remove();

                                            var ni = find(self.items, evt.newIndex);

                                            var widget = shell.getWidget(w);

                                            // TODO Initialize params in service layer

                                            self.items.splice(ni, 0, {
                                                type: widget.id,
                                                resource: {
                                                    params: [],
                                                    _action: 'create'
                                                },
                                                params: widget.params
                                                    ? JSON.parse(JSON.stringify(widget.params))
                                                    : {}
                                                ,
                                                widgets: [],
                                                _action: 'create',
                                            });
                                        }

                                    } else {

                                        var dragged = {
                                            vue: evt.from.__dragged__,
                                            item: $('.ge.ge-widget', evt.item),
                                            clone: $('.ge.ge-widget', evt.clone),
                                        };

                                        var container = $(evt.to).closest('.ge.ge-widget').get(0).__vue__;

                                        var ni = find(self.items, evt.newIndex);

                                        var newItem = JSON.parse(JSON.stringify(dragged.vue.model));
                                        newItem._action = 'create';
                                        delete newItem.resource.id;
                                        delete newItem.id;

                                        dragged.item.remove();

                                        container.items.splice(ni, 0, newItem);
                                        container.items = container.items.slice();
                                    }
                                },

                                onStart: function (evt) {
                                    evt.from.__dragged__ = $('.ge.ge-widget', evt.item).get(0).__vue__;
                                },

                                onRemove: function(evt) {

                                    var dragged = {
                                        vue: evt.from.__dragged__,
                                        item: $('.ge.ge-widget', evt.item),
                                        clone: $('.ge.ge-widget', evt.clone),
                                    };

                                    var stack =  dragged.vue.$parent.$parent.$parent;

                                    dragged.clone.remove();

                                    if (dragged.vue.model._action == 'create') {
                                        stack.items.$remove(dragged.vue.model);
                                    } else {
                                        dragged.vue.model._action = 'remove';
                                    }

                                    stack.items = stack.items.slice();
                                },

                                onUpdate: function (evt) {

                                    var oi = self.items.indexOf(evt.from.__dragged__.model);
                                    var ni = find(self.items, evt.newIndex);

                                    if (oi != ni) {
                                        self.items.splice(ni, 0, self.items.splice(oi, 1)[0]);
                                        self.items = self.items.slice();
                                    }
                                },

                                onEnd: function (evt) {

                                    delete evt.from.__dragged__;
                                }
                            });

                        } else {

                            if (self.sortable) {
                                self.sortable.destroy();
                                self.sortable = null;
                            }
                        }
                    }, {
                        immediate: true
                    });
                }
            },

            methods: {
                selectTarget: function() {
                    this.selected = true;
                },

                unselectTarget: function() {
                    this.selected = false;
                },
            }
        };
    };

    Vue.component('shell-decorator-stub', {
        template: '#shell-decorator-stub',
        mixins: [ DecoratorMixin, BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-widget', {
        template: '#shell-decorator-widget',
        mixins: [ DecoratorMixin, BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-horisontal', {
        template: '#shell-decorator-horisontal',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table >.wg.wg-row'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Horisontal Stack', 'Drop Here'); }
        },
    });

    Vue.component('shell-decorator-vertical', {
        template: '#shell-decorator-vertical',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

    Vue.component('shell-decorator-canvas', {
        template: '#shell-decorator-canvas',
        mixins: [ CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table') ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            editable: Boolean,
            items: Array,
        },
        created: function() {
            this.selected = true;
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

})(jQuery, Vue, Core, Shell);

(function($,Vue, undefined) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

(function($, Vue, Shell, undefined) {

    Shell.Loader =
    Vue.component('shell-loader', {
        template: '#shell-loader',
        created: function() {
            console.log(this.$route);
        }
    });

})(jQuery, Vue, Shell);

(function($, Vue, Core, undefined) {

    Vue.component('shell-page', {
        template: '#shell-page',
        mixins: [ /*Core.ContainerMixin, Core.SortableMixin*/ ],
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
        data: function() {
            return {
                decorator: this.decorator,
                data: this.data,
                storage: this.storage,
                pageSettings: {},
            };
        },
        created: function() {

            var runtime = Vue.service('runtime');

            this.decorator = 'shell-decorator-canvas';
            this.data = {};
            this.storage = {};

            this.$watch('page.resource', (resource) => {
                this.$set('pageSettings.width', '960px'); // default
                if (resource) {
                    for (param in resource.params) {
                        this.$set('pageSettings.' + resource.params[param].name, resource.params[param].value);
                    }
                }
            }, {
                immediate: true,
                deep: true,
            });

            this.$watch('page.storages', (storages) => {

                if (storages) {

                    var storage = {};

                    for (var i = 0; i < storages.length; i++) {

                        var st = storages[i];
                        storage[st.name] = {};

                        for (var j = 0; j < st.variables.length; j++) {

                            var variable = st.variables[j];
                            storage[st.name][variable.name] = {
                                value: runtime.evaluate(this, variable.binding, variable.value) || null
                            };
                        }
                    }

                    this.$set('storage', storage);
                }
            }, {
                immediate: true,
                deep: true,
            });

            this.$watch('page.sources', (sources) => {

                if (sources) {

                    var deferred = [];
                    for (var i = 0; i < sources.length; i++) {
                        deferred.push(this.doRequest(sources[i]));
                    }

                    if (deferred.length > 1) {

                        $.when.apply(this, deferred).done(function() {
                            var data = {};
                            for (var i = 0; i < arguments.length; i++) {
                                data[sources[i].name] = arguments[i][0];
                            }
                            this.$set('data', data);
                        }.bind(this));

                    } else if (deferred.length == 1) {

                        deferred[0].done(function(d) {
                            var data = {};
                            data[sources[0].name] = d;
                            this.$set('data', data);
                        }.bind(this));
                    }
                }

            }, {
                immediate: true,
                deep: true,
            });
        },
        methods: {
            doRequest: function(s) {
                var query = {};
                for (var i = 0; i < s.params.length; i++) {
                    var param = s.params[i];
                    if (param.in == 'query' && param.specified) {

                        var value = param.binding
                                ? this.$interpolate(param.binding) // TODO Interpolate in page context
                                : param.value
                            ;

                        query[param.name] = value;
                    }
                }

                return $.ajax({
                    method: s.method,
                    url: s.url,
                    dataType: "json",
                    data: query,
                });
            }
        },
    });

})(jQuery, Vue, Core);

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
                sort: false,
                // onStart: function(evt) {
                //     console.log(evt);
                //     $(evt.item).html('<b>Data</b>');
                // }
                // setData: function (dataTransfer, dragEl) {
                //     console.log(dragEl);
                //     $(dragEl).html('<b>Hello</b>');
                //     // dataTransfer.setData('Text', dragEl.textContent);
                // },
                // setData: function(dataTransfer, dragEl) {
                //     dataTransfer.setData('Text', dragEl.textContent);
                // }
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

(function($, Vue, Shell, undefined) {

    Shell.Shell = {
        // props: {
        //     selection: Object,
        //     settings: Object,
        //     model: Object,
        // },
        data: function() {
            return {
                globals: this.globals,
            };
        },
        created: function() {

            // this.$http({
            //     url: '',
            //
            // })

            // console.log(this.$route.params.domain);
            // console.log(this.$route.params.page);

            Vue.service('shell', {

                getWidget: (id) => {

                    for (var i = 0; i < this.settings.widgets.length; i++) {
                        var w = this.settings.widgets[i];
                        if (w.id == id) {
                            return w;
                        }
                    }

                    return null;
                },
            });

            this.globals = {
                selection: this.selection,
                settings: this.settings,
                model: this.model,
            };
        },
    };

    Shell.ShellPublic =
    Vue.component('shell-public', {
        mixins: [ Shell.Shell ],
        template: '#shell-public',
    });

    Shell.ShellPrivate =
    Vue.component('shell-private', {

        mixins: [ Shell.Shell ],
        template: '#shell-private',

        created: function() {

            // this.$http()

            function relevant(current, collection) {

                if (!current || current._action == 'remove' || (collection && collection.indexOf(current) < 0)) {

                    if (collection) {
                        for (var i = 0; i < collection.length; i++) {
                            var c = collection[i];
                            if (c._action != 'remove') {
                                return c;
                            }
                        }
                    }

                    return null;
                }

                if (current && current._action == 'remove') {
                    return null;
                }

                return current;
            }

            this.$watch('settings.categories', (categories) => {

                var category = null;
                if (categories.length > 0) {
                    var sub = categories[0];
                    if (categories.length > 0) {
                        category = sub.categories[0];
                    }
                }
                this.selection.category = category;
            }, {
                immediate: true,
            });

            this.$watch('model.domains', (domains) => {
                this.selection.domain = relevant(this.selection.domain, domains);
            }, {
                immediate: true,
            });

            this.$watch('model.pages', (pages) => {
                this.selection.page = relevant(this.selection.page, pages);
            }, {
                immediate: true,
            });

            this.$watch('selection.page.sources', (sources) => {
                this.selection.source = relevant(this.selection.source, sources);
            }, {
                immediate: true,
            });

            this.$watch('selection.page.storages', (storages) => {
                this.selection.storage = relevant(this.selection.storage, storages);
            }, {
                immediate: true,
            });

        },
        methods: {

            getWidget: function(id) {

                for (var i = 0; i < this.settings.widgets.length; i++) {
                    var w = this.settings.widgets[i];
                    if (w.id == id) {
                        return w;
                    }
                }

                return null;
            },
        },
        events: {
            pull: function(data) {
                $.ajax({
                    url: '/settings',
                    method: 'GET',
                    dataType: "json"
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            push: function(data) {
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
            selectCategory: function(data) {
                this.selection.category = data.item;
            },
            selectDomain: function(data) {
                this.selection.domain = data.item;
            },
            selectPage: function(data) {
                this.selection.page = data.item;
            },
            selectSource: function(data) {
                this.selection.source = data.item;
            },
            selectStorage: function(data) {
                this.selection.storage = data.item;
            },
        }
    });

})(jQuery, Vue, Shell, undefined);

(function($,Vue, undefined) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

// (function($, Vue, Core, undefined) {
//
//     Vue.component('shell-stacked', {
//         template: '#shell-stacked',
//         mixins: [ Core.Stacked ]
//     });
//
// })(jQuery, Vue, Core, Shell);

(function($,Vue, undefined) {

    Vue.component('shell-storages', {
        template: '#shell-storages',
        props: {
            storages: Array,
            globals: Object,
        },
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
Shell.Widgets = window.Shell.Widgets || {};

(function($, Vue, Shell, undefined) {

    Shell.Widget =
    Vue.component('shell-widget', {
        template: '#shell-widget',
        mixins: [ /* Core.DecoratorMixin, Core.ContainerMixin, Core.SortableMixin, Core.BindingsMixin */ ],
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            stack: Object,
            model: Object,
            data: Object,
            storage: Object,
            editable: Boolean,
        },
        init: function() {
            this.decorators = {
                alternatives: {
                    // 'default-stack-page': function() { Object.assign(this, { selector: '.wg.wg-table', stub: stub('Vertical Stack', 'Drop Here') }) },
                    // 'default-stack-horisontal': function() { Object.assign(this, { selector: '.wg.wg-row', stub: stub('Horisontal Stack', 'Drop Here') }) },
                    // 'default-stack-vertical': function() { Object.assign(this, { selector: '.wg.wg-table', stub: stub('Vertical Stack', 'Drop Here') }) },
                    'default-stack-horisontal': 'shell-decorator-horisontal',
                    'default-stack-vertical': 'shell-decorator-vertical',
                    'default-stub': 'shell-decorator-stub',
                },
                fallback: 'shell-decorator-widget',
            };
        },
        created: function() {

            // console.log('widget');

            var shell = Vue.service('shell');

            this.widget = shell.getWidget(this.model.type);
            this.decorator = this.decorators.alternatives[this.widget.tag] || this.decorators.fallback;

            // console.log(this.$route);
            // this.decorator = 'shell-decorator-stub';
        },
        data: function() {

            return {
                widget: this.widget,
                decorator: this.decorator,
                // items: this.widgets,
            };
        },
    });

})(jQuery, Vue, Shell);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUuanMiLCJwdWJsaWMuanMiLCJiaW5kaW5ncy9iaW5kaW5ncy5qcyIsImNvbXBvbmVudHMvZm9ybS5qcyIsImNvbXBvbmVudHMvZ3JpZC5qcyIsImNvbXBvbmVudHMvaW5saW5lLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImRpcmVjdGl2ZXMvY29tYm8uanMiLCJkaXJlY3RpdmVzL2RhdGUuanMiLCJkaXJlY3RpdmVzL3RhZ3MuanMiLCJkb21haW5zL2RvbWFpbnMuanMiLCJob29rcy9tb2RhbC5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJwYWdlcy9wYWdlcy5qcyIsImxhbmRpbmcvbGFuZGluZy5qcyIsInBhcmFtcy9wYXJhbXMuanMiLCJzY2hlbWVzL3NjaGVtZXMuanMiLCJzZXJ2aWNlcy9wb3J0YWxzLmpzIiwic2VydmljZXMvc2VjdXJpdHkuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5qcyIsInN0b3JhZ2VzL3N0b3JhZ2VzLmpzIiwid2lkZ2V0cy93aWRnZXRzLmpzIiwicGFnZXMvc291cmNlcy9zb3VyY2VzLmpzIiwicGFnZXMvd2lkZ2V0cy93aWRnZXRzLmpzIiwibGFuZGluZy9hY2NvdW50L2FjY291bnQuanMiLCJsYW5kaW5nL2JlbmVmaXRzL2JlbmVmaXRzLmpzIiwibGFuZGluZy9jb250YWN0cy9jb250YWN0cy5qcyIsImxhbmRpbmcvZm9vdGVyL2Zvb3Rlci5qcyIsImxhbmRpbmcvZmVlZGJhY2svZmVlZGJhY2suanMiLCJsYW5kaW5nL2dhbGxlcnkvZ2FsbGVyeS5qcyIsImxhbmRpbmcvaGVhZGVyL2hlYWRlci5qcyIsImxhbmRpbmcvbWFuYWdlL21hbmFnZS5qcyIsImxhbmRpbmcvcHJpY2luZy9wcmljaW5nLmpzIiwibGFuZGluZy9zdG9yYWdlL3N0b3JhZ2UuanMiLCJsYW5kaW5nL3VzZWNhc2VzL3VzZWNhc2VzLmpzIiwibGFuZGluZy9zdXBlci9zdXBlci5qcyIsImxhbmRpbmcvdmlkZW8vdmlkZW8uanMiLCJzaGVsbC9hY3Rpb25zL2FjdGlvbnMuanMiLCJzaGVsbC9icmFuZC9icmFuZC5qcyIsInNoZWxsL2NhdGVnb3JpZXMvY2F0ZWdvcmllcy5qcyIsInNoZWxsL2NvbnRhaW5lci9jb250YWluZXIuanMiLCJzaGVsbC9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzIiwic2hlbGwvZG9tYWlucy9kb21haW5zLmpzIiwic2hlbGwvbG9hZGVyL2xvYWRlci5qcyIsInNoZWxsL3BhZ2UvcGFnZS5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc2hlbGwvc2hlbGwuanMiLCJzaGVsbC9zb3VyY2VzL3NvdXJjZXMuanMiLCJzaGVsbC9zdGFja2VkL3N0YWNrZWQuanMiLCJzaGVsbC9zdG9yYWdlcy9zdG9yYWdlcy5qcyIsInNoZWxsL3N0dWIvc3R1Yi5qcyIsInNoZWxsL3RhcmdldC90YXJnZXQuanMiLCJzaGVsbC93aWRnZXQvd2lkZ2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUNBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdnVlLXB1YmxpY10nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoZWxlbWVudCkuZGF0YSgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIEFwcCA9IFZ1ZS5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScsIENvcmUuU2VjdXJpdHlGYWN0b3J5KHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycsIENvcmUuUG9ydGFsc0ZhY3RvcnkodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcm91dGVyID0gbmV3IFZ1ZVJvdXRlcih7XHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJvdXRlci5iZWZvcmVFYWNoKGZ1bmN0aW9uKHRyYW5zaXRpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi50by5hdXRoICYmICFyb3V0ZXIuYXBwLnByaW5jaXBhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24uYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbi50by5hbm9uICYmIHJvdXRlci5hcHAucHJpbmNpcGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5hYm9ydCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLm5leHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcm91dGVzID0ge1xyXG4gICAgICAgICAgICAgICAgJy8nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdQYWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvZ2FsbGVyeSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc3RvcmFnZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1N0b3JhZ2VQYWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc2lnbmluJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbmluUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc2lnbnVwJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbnVwUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nTWFuYWdlUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlLWNyZWF0ZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL3NpdGUvOmRvbWFpbi86cGFnZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLlNoZWxsUHVibGljLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UvOmRvbWFpbic6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLkxvYWRlcixcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlLzpkb21haW4vOnBhZ2UnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5Mb2FkZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVSb3V0ZShwYWdlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuU2hlbGxQdWJsaWMuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGF0YS5tb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vZGVsLnBhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWdlID0gZGF0YS5tb2RlbC5wYWdlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICByb3V0ZXNbcGFnZS5uYW1lXSA9IGNyZWF0ZVJvdXRlKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByb3V0ZXIubWFwKHJvdXRlcyk7XHJcblxyXG4gICAgICAgICAgICByb3V0ZXIuc3RhcnQoQXBwLCAkKCdbZGF0YS12dWUtYm9keV0nLCBlbGVtZW50KS5nZXQoMCkpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnYmluZGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2JpbmRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knLCBzdHJhdGVneSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGdldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnQuYmluZGluZykgdGhpcy5jdXJyZW50LmJpbmRpbmcgPSB7fTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncycsIHtcclxuXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiVnVlLmNvbXBvbmVudCgndi1mb3JtJywge1xyXG5cclxuXHRwcm9wczoge1xyXG5cdFx0YWN0aW9uOiBTdHJpbmcsXHJcblx0XHRtZXRob2Q6IFN0cmluZyxcclxuXHRcdGluaXQ6IE9iamVjdCxcclxuXHRcdGRvbmU6IEZ1bmN0aW9uLFxyXG5cdFx0ZmFpbDogRnVuY3Rpb24sXHJcblx0XHRtb2RlbDogT2JqZWN0LFxyXG5cdH0sXHJcblxyXG5cdC8vIHJlcGxhY2U6IGZhbHNlLFxyXG5cclxuXHQvLyB0ZW1wbGF0ZTogYFxyXG5cdC8vIFx0PGZvcm0+XHJcblx0Ly8gXHRcdDxzbG90Pjwvc2xvdD5cclxuXHQvLyBcdDwvZm9ybT5cclxuXHQvLyBgLFxyXG5cclxuXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xyXG5cclxuXHRcdHRoaXMub3JpZ2luYWwgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKTtcclxuXHJcblx0XHQkKHRoaXMuJGVsKVxyXG5cclxuXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLnN1Ym1pdCgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQub24oJ3Jlc2V0JywgKGUpID0+IHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdGRvbmUoKTtcclxuXHR9LFxyXG5cclxuXHRkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHRtZXRob2RzOiB7XHJcblxyXG5cdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubW9kZWwpO1xyXG5cclxuXHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHR1cmw6IHRoaXMuYWN0aW9uLFxyXG5cdFx0XHRcdG1ldGhvZDogdGhpcy5tZXRob2QsXHJcblx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG5cdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpXHJcblx0XHRcdH0pXHJcblx0XHRcdC5kb25lKChkKSA9PiB7XHJcblx0XHRcdFx0aWYgKGRvbmUgaW4gdGhpcykgdGhpcy5kb25lKGQpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxyXG5cdFx0fSxcclxuXHJcblx0XHRyZXNldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgdGhpcy5vcmlnaW5hbCk7XHJcblx0XHR9XHJcblx0fSxcclxufSk7IiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG5cdC8vIHZhciBtb2RlbCA9IHtcclxuXHQvLyBcdGxpc3Q6IFtdXHJcblx0Ly8gfTtcclxuXHQvL1xyXG5cdC8vIHZhciBib2R5ID0gVnVlLmV4dGVuZCh7XHJcblx0Ly8gXHRjcmVhdGVkOiBmdW5jdGlvbigpICB7IHRoaXMuJGRpc3BhdGNoKCdyZWdpc3Rlci1ib2R5JywgdGhpcykgfSxcclxuXHQvLyB9KTtcclxuXHJcblx0VnVlLmNvbXBvbmVudCgnZ3JpZC10YWJsZScsIHtcclxuXHJcblx0XHRyZXBsYWNlOiBmYWxzZSxcclxuXHJcblx0XHRwcm9wczoge1xyXG5cdFx0XHRkOiBBcnJheVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHRcdC8vIFx0cmV0dXJuIHtcclxuXHRcdC8vIFx0XHRpdGVtczogdGhpcy5kLnNsaWNlKDApXHJcblx0XHQvLyBcdH1cclxuXHRcdC8vIH0sXHJcblxyXG5cdFx0bWV0aG9kczoge1xyXG5cclxuXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnYXNkYXNkJyk7XHJcblx0XHRcdFx0dGhpcy5pdGVtcy5wdXNoKHt9KTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLml0ZW1zKTtcclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcclxuXHRcdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0fSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ2lubGluZS10ZXh0JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLWNoZWNrYm94JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtc2VsZWN0JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ29wdGlvbnMnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxzZWxlY3QgY2xhc3M9XCJpbmxpbmUtY29udHJvbDFcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiPlxyXG5cdFx0XHRcdFx0PG9wdGlvbiB2LWZvcj1cIm9wdGlvbiBpbiBvcHRpb25zXCIgdmFsdWU9XCJ7eyBvcHRpb24ua2V5IH19XCI+e3sgb3B0aW9uLnZhbHVlIH19PC9vcHRpb24+XHJcblx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnY2xhc3MnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PHNwYW4gOmNsYXNzPVwiY2xhc3NcIj57eyB2YWx1ZSB9fTwvc3Bhbj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG4iLCJWdWUuY29tcG9uZW50KCdtb2RhbCcsIHtcclxuXHJcbiAgICBwcm9wczoge1xyXG4gICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgY3VycmVudDogT2JqZWN0LFxyXG4gICAgICAgIG9yaWdpbmFsOiBPYmplY3QsXHJcbiAgICB9LFxyXG5cclxuICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdzdWJtaXQnLCB0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMub3JpZ2luYWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xyXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZXNldCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5jdXJyZW50LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub3JpZ2luYWwpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgnY29tYm8nLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkuc2VsZWN0Mih7XHJcblx0XHRcdFx0dGFnczogdHJ1ZSxcclxuXHRcdFx0XHRtdWx0aXBsZTogZmFsc2UsXHJcblx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRpZDogcGFyYW1zLnRlcm0sXHJcblx0XHRcdFx0XHRcdHRleHQ6IHBhcmFtcy50ZXJtLFxyXG5cdFx0XHRcdFx0XHRuZXdPcHRpb246IHRydWVcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgnZGF0ZScsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHJcblx0XHRpZiAoJC5mbi5kYXRlcGlja2VyKSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLmRhdGVwaWNrZXIoe1xyXG5cdFx0XHRcdGF1dG9jbG9zZTogdHJ1ZSxcclxuXHRcdFx0XHR0b2RheUhpZ2hsaWdodDogdHJ1ZSxcclxuXHRcdFx0XHRmb3JtYXQ6IFwieXl5eS1tbS1kZFwiXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCd0YWdzJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLnRhZ3NpbnB1dCh7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSk7XHJcbiIsIlZ1ZS5maWx0ZXIoJ3RlbXBsYXRlJywgZnVuY3Rpb24gKHN0cmluZywgZGF0YSkge1xyXG5cclxuXHR2YXIgcmUgPSAvJHsoW159XSspfS9nO1xyXG5cdHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGtleSkge1xyXG5cdFx0cmV0dXJuIGRhdGFba2V5XTtcclxuXHR9KTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdhc3NpZ24nLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKSB7XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignY29weScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWdWUoe1xyXG5cdFx0ZGF0YTogc291cmNlICE9IG51bGxcclxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXHJcblx0XHRcdDogbnVsbFxyXG5cdH0pLiRkYXRhO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2Nsb25lJywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuXHRyZXR1cm4gbmV3IFZ1ZSh7XHJcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxyXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuXHRcdFx0OiBudWxsXHJcblx0fSkuJGRhdGE7XHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgTWV0YXNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1ldGFzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNZXRhc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKE1ldGFzTGlzdFZpZXdlciwgTWV0YXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1BhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdHYWxsZXJ5UGFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWdhbGxlcnktcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnktcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdTdG9yYWdlUGFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UtcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdTaWduaW5QYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc2lnbmluLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zaWduaW4tcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdTaWdudXBQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc2lnbnVwLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zaWdudXAtcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdQcm9maWxlUGFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXByb2ZpbGUtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByb2ZpbGUtcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtcGFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VDcmVhdGVQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLWNyZWF0ZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlLWNyZWF0ZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIFBhcmFtU3RyaW5nID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zdHJpbmcnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXN0cmluZycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtUmljaCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtcmljaCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtcmljaCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtU291cmNlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zb3VyY2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXNvdXJjZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW0uaXRlbXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1zID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGdldExhYmVsOiBmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcC5kaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZtID0gbmV3IFZ1ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLiRpbnRlcnBvbGF0ZSh0aGlzLnByb3AuZGlzcGxheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxpdGVtPic7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtYmluZGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1iaW5kaW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdiaW5kaW5nJykgXSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIHZhciBiaW5kaW5nID0gdGhpcy5jdXJyZW50LmJpbmRpbmcgfHwge307XHJcbiAgICAgICAgICAgIGlmICghYmluZGluZy5zdHJhdGVneSkgYmluZGluZy5zdHJhdGVneSA9ICdpbnRlcnBvbGF0ZSc7XHJcblxyXG4gICAgICAgICAgICBiaW5kaW5nLnBhcmFtcyA9IGJpbmRpbmcucGFyYW1zIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC5wcm9wLnByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gYmluZGluZy5wYXJhbXNbcHJvcC5uYW1lXSA9IGJpbmRpbmcucGFyYW1zW3Byb3AubmFtZV0gfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZycsIGJpbmRpbmcpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jywgc3RyYXRlZ3kpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRnZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1iaW5kaW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvcildLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlZCcsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcik7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gfHwgeyB2YWx1ZTogbnVsbCB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsIGl0ZW1zKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWVkaXRvcicsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtZWRpdG9yJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBQYXJhbXNMaXN0ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1saXN0JyxcclxuICAgICAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgICAgICAgICdwYXJhbXMtc3RyaW5nJzogUGFyYW1TdHJpbmcsXHJcbiAgICAgICAgICAgICdwYXJhbXMtcmljaCc6IFBhcmFtUmljaCxcclxuICAgICAgICAgICAgJ3BhcmFtcy1zb3VyY2UnOiBQYXJhbVNvdXJjZSxcclxuICAgICAgICAgICAgJ3BhcmFtcy1tdWx0aXBsZSc6IFBhcmFtTXVsdGlwbGUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxyXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIkNvcmUgPSB3aW5kb3cuQ29yZSB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIENvcmUuUG9ydGFsc0ZhY3RvcnkgPSBmdW5jdGlvbihvd25lcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgbG9hZDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5nZXQoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBjcmVhdGU6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5kZWxldGUoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5kZWxldGUoJy93cy9zZXR0aW5ncycsIGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIkNvcmUgPSB3aW5kb3cuQ29yZSB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIENvcmUuU2VjdXJpdHlGYWN0b3J5ID0gZnVuY3Rpb24ob3duZXIpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHNpZ251cDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbnVwJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IG51bGw7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBzaWduaW46IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3NpZ25pbicsIGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICAgICAgc2lnbm91dDogKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdub3V0JykudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkb21haW5zJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgU3RvcmFnZXNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU3RvcmFnZXNMaXN0Vmlld2VyLCBTdG9yYWdlc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzVmFyaWFibGVzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzVmFyaWFibGVzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzVmFyaWFibGVzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFN0b3JhZ2VzVmFyaWFibGVzTGlzdFZpZXdlciwgU3RvcmFnZXNWYXJpYWJsZXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLXZhcmlhYmxlcycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgU291cmNlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIFdpZGdldHNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24odykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdsb2JhbHMud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmdsb2JhbHMud2lkZ2V0c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAody50eXBlID09IHdpZGdldC5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2lkZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPIE1vdmUgdG8gc2VydmljZSBsYXllclxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50LnBhcmFtc1twcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50LnBhcmFtc1twcm9wLm5hbWVdIHx8IHtcclxuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gW10gOiBudWxsKSxcclxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IG51bGwgOiB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGhhc1Byb3BzOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgV2lkZ2V0c0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oV2lkZ2V0c0xpc3RWaWV3ZXIsIFdpZGdldHNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBwcm90bzogZnVuY3Rpb24od2lkZ2V0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHdpZGdldC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIE1vdmUgdG8gc2VydmljZSBsYXllclxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IFtdIDogbnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gbnVsbCA6IHVuZGVmaW5lZCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLnBhcmFtcyA9IHBhcmFtcztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIHZhbGlkYXRpb24gPSB7XHJcbiAgICAgICAgZW1haWw6IFwiL14oW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspQChbYS16QS1aMC05X1xcXFwuXFxcXC1dKylcXFxcLihbYS16QS1aMC05XXsyLH0pJC9nXCIsXHJcbiAgICB9O1xyXG5cclxuICAgIExhbmRpbmcuU2lnbmluID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1zaWduaW4nLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ25pbicsXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB2YWxpZGF0aW9uLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2V0KCdmb3JtJywge1xyXG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogbnVsbCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNpZ25pbjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbmluKHtcclxuICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5mb3JtLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgTGFuZGluZy5TaWdudXAgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXNpZ251cCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWFjY291bnQtc2lnbnVwJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHZhbGlkYXRpb24sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XHJcbiAgICAgICAgICAgICAgICBlbWFpbDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBudWxsLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc2lnbnVwOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknKS5zaWdudXAoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLmZvcm0uZW1haWwsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuZm9ybS5wYXNzd29yZCxcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLlByb2ZpbGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXByb2ZpbGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXByb2ZpbGUnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIiIsIiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuRm9vdGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZm9vdGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZm9vdGVyJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCJMYW5kaW5nID0gd2luZG93LkxhbmRpbmcgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBMYW5kaW5nLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBMYW5kaW5nLkZlZWRiYWNrID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZmVlZGJhY2snLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mZWVkYmFjaycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5HYWxsZXJ5ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnknLFxyXG4gICAgfSk7XHJcblxyXG4gICAgTGFuZGluZy5HYWxsZXJ5RnVsbCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWdhbGxlcnktZnVsbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnktZnVsbCcsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5IZWFkZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1oZWFkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1oZWFkZXInLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc2lnbm91dDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknKS5zaWdub3V0KCkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCJMYW5kaW5nID0gd2luZG93LkxhbmRpbmcgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBMYW5kaW5nLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBMYW5kaW5nLk1hbmFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLW1hbmFnZScsIHtcclxuXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UnLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICsgKHdpbmRvdy5sb2NhdGlvbi5wb3J0ID8gJzonICsgd2luZG93LmxvY2F0aW9uLnBvcnQ6ICcnKSxcclxuICAgICAgICAgICAgICAgIHBvcnRhbHM6IHRoaXMucG9ydGFscyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5sb2FkKCkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRzZXQoJ3BvcnRhbHMnLCBkLmRhdGEucG9ydGFscyk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgdGhpcy4kc2V0KCdwb3J0YWxzJywgW10pOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5yZW1vdmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLnJlZnJlc2goKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTWFuYWdlQ3JlYXRlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLWNyZWF0ZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1jcmVhdGUnLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2V0KCdmb3JtJywge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IG51bGwsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5mb3JtLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnL21hbmFnZScpfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCJMYW5kaW5nID0gd2luZG93LkxhbmRpbmcgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBMYW5kaW5nLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBMYW5kaW5nLlN0b3JhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wcmljaW5nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJpY2luZycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5TdG9yYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgTGFuZGluZy5TdG9yYWdlRnVsbCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UtZnVsbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UtZnVsbCcsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5Vc2VjYXNlcyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXVzZWNhc2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdXNlY2FzZXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuU3VwZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdXBlcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN1cGVyJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCJMYW5kaW5nID0gd2luZG93LkxhbmRpbmcgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBMYW5kaW5nLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBMYW5kaW5nLlZpZGVvID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctdmlkZW8nLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy12aWRlbycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICB2YXIgc2NhbGUgPSAxO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWFjdGlvbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYWN0aW9ucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcclxuICAgICAgICAgICAgZG9tYWluOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgem9vbTogZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHNjYWxlICs9IChldmVudCA9PSAnaW4nKSA/IDAuMSA6IC0wLjE7XHJcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtcGFnZScpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBzY2FsZSArICcpJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtY2F0ZWdvcmllcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1jYXRlZ29yaWVzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jb250YWluZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY29udGFpbmVyJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmdsb2JhbHMsIHRoaXMuc2V0dGluZ3MsIHRoaXMucGFnZSwgdGhpcy5jYXRlZ29yeSk7XHJcbiAgICAgICAgICAgIC8vIHJldHVybiB7XHJcbiAgICAgICAgICAgIC8vICAgICBwYWdlOiB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2VcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAgLy8gcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmdsb2JhbHMsIHRoaXMuc2V0dGluZ3MsIHRoaXMucGFnZSk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIHZhciBydW50aW1lID0gVnVlLnNlcnZpY2UoJ3J1bnRpbWUnLCB7XHJcblxyXG4gICAgICAgIGV2YWx1YXRlOiBmdW5jdGlvbihzZWxmLCBiLCB2KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChiLnN0cmF0ZWd5ID09ICdldmFsJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLiRldmFsKGIuZXhwcmVzc2lvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGIuc3RyYXRlZ3kgPT0gJ3dpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuJGdldChiLmV4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndmFsdWUnLCB2YWx1ZSwgYik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi4kaW50ZXJwb2xhdGUoYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBldmFsdWF0ZSBleHByZXNzaW9uJywgYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXZhbHVhdGVQYXJhbXM6IGZ1bmN0aW9uKHNlbGYsIHByb3BzLCBwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gcGFyYW1zICYmIHBhcmFtc1twcm9wLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0gfHwge30sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBuID0gaXRlbS5wcm9wLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgciA9IGl0ZW0ucHJvcC52YXJpYWJsZTtcclxuICAgICAgICAgICAgICAgIHZhciBiID0gaXRlbS5wYXJhbS5iaW5kaW5nO1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBpdGVtLnBhcmFtLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnByb3AudHlwZSA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gSW1wbGVtZW50XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0ucHJvcC50eXBlID09ICdtdWx0aXBsZScpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIgJiYgYi5leHByZXNzaW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmlzQXJyYXkocmVzdWx0KSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlc3VsdC5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZtID0gbmV3IFZ1ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VsZi4kZGF0YSkpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdFtqXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5ldmFsdWF0ZVBhcmFtcyh2bSwgaXRlbS5wcm9wLnByb3BzLCBiLnBhcmFtcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnYgPSBhcnJheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpID0gdltqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2aS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlbaW5kZXgrK10gPSB0aGlzLmV2YWx1YXRlUGFyYW1zKHNlbGYsIGl0ZW0ucHJvcC5wcm9wcywgdmkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2diA9IHIgPyB7IHZhbHVlOiBhcnJheSB9IDogYXJyYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2diA9IHJ1bnRpbWUuZXZhbHVhdGUoc2VsZiwgYiwgdik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVbbl0gPSB2djtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc3R1Yih0aXRsZSwgc3VidGl0bGUpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnTlRSMVhEZWZhdWx0QnVuZGxlL1N0dWInLFxyXG4gICAgICAgICAgICBfYWN0aW9uOiAnaWdub3JlJyxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogeyB2YWx1ZTogdGl0bGUgfSxcclxuICAgICAgICAgICAgICAgIHN1YnRpdGxlOiB7IHZhbHVlOiBzdWJ0aXRsZSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIERlY29yYXRvck1peGluID0ge1xyXG5cclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgcmVtb3ZlV2lkZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZW1vdmVDaGlsZFdpZGdldCcsIHsgaXRlbTogdGhpcy5tb2RlbCB9KTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRvQXBwbHk6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcclxuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLm1vZGVsLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm1vZGVsLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgc2hvd1NldHRpbmdzOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0FwcGx5KHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgdmFyIEJpbmRpbmdzTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYmluZGluZ3M6IHRoaXMuYmluZGluZ3MsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZGF0YScsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCB0aGlzLm1vZGVsLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzdG9yYWdlJywgKHN0b3JhZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIHRoaXMubW9kZWwucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsJywgKG1vZGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCBtb2RlbC5wYXJhbXMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBDb21wb3NpdGVNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5jaGlsZHJlbixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdpdGVtcycsIChpdGVtcykgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc3R1YigpKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXZlbnRzOiB7XHJcblxyXG4gICAgICAgICAgICByZW1vdmVDaGlsZFdpZGdldDogZnVuY3Rpb24oZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gZGF0YS5pdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgdmFyIFNvcnRhYmxlTWl4aW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluZChjaGlsZHJlbiwgZG9tSW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoICYmIGluZGV4IDwgZG9tSW5kZXg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHJvdXRlLnByaXZhdGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNoZWxsID0gVnVlLnNlcnZpY2UoJ3NoZWxsJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3YXRjaCgnc2VsZWN0ZWQnLCBmdW5jdGlvbihzZWxlY3RlZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUoJChzZWxlY3Rvciwgc2VsZi4kZWwpLmdldCgwKSwge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1bGw6ICdjbG9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IDE1MCxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25BZGQ6IGZ1bmN0aW9uIChldnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYWxldHRlID0gJChldnQuaXRlbSkuY2xvc2VzdCgnLmdlLmdlLXBhbGV0dGUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gJChldnQuaXRlbSkuZGF0YSgnd2lkZ2V0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFsZXR0ZS5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChldnQuaXRlbSkucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdpZGdldCA9IHNoZWxsLmdldFdpZGdldCh3KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBJbml0aWFsaXplIHBhcmFtcyBpbiBzZXJ2aWNlIGxheWVyXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMuc3BsaWNlKG5pLCAwLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHdpZGdldC5wYXJhbXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3aWRnZXQucGFyYW1zKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXRzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcmFnZ2VkID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ1ZTogZXZ0LmZyb20uX19kcmFnZ2VkX18sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogJCgnLmdlLmdlLXdpZGdldCcsIGV2dC5pdGVtKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZTogJCgnLmdlLmdlLXdpZGdldCcsIGV2dC5jbG9uZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSAkKGV2dC50bykuY2xvc2VzdCgnLmdlLmdlLXdpZGdldCcpLmdldCgwKS5fX3Z1ZV9fO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SXRlbSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZHJhZ2dlZC52dWUubW9kZWwpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0ucmVzb3VyY2UuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5pZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLml0ZW0ucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLml0ZW1zLnNwbGljZShuaSwgMCwgbmV3SXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXRlbXMgPSBjb250YWluZXIuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhcnQ6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LmZyb20uX19kcmFnZ2VkX18gPSAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0Lml0ZW0pLmdldCgwKS5fX3Z1ZV9fO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVtb3ZlOiBmdW5jdGlvbihldnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcmFnZ2VkID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiBldnQuZnJvbS5fX2RyYWdnZWRfXyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06ICQoJy5nZS5nZS13aWRnZXQnLCBldnQuaXRlbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZTogJCgnLmdlLmdlLXdpZGdldCcsIGV2dC5jbG9uZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhY2sgPSAgZHJhZ2dlZC52dWUuJHBhcmVudC4kcGFyZW50LiRwYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLmNsb25lLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWQudnVlLm1vZGVsLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLml0ZW1zLiRyZW1vdmUoZHJhZ2dlZC52dWUubW9kZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZC52dWUubW9kZWwuX2FjdGlvbiA9ICdyZW1vdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pdGVtcyA9IHN0YWNrLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChldnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvaSA9IHNlbGYuaXRlbXMuaW5kZXhPZihldnQuZnJvbS5fX2RyYWdnZWRfXy5tb2RlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvaSAhPSBuaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UobmksIDAsIHNlbGYuaXRlbXMuc3BsaWNlKG9pLCAxKVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gc2VsZi5pdGVtcy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FbmQ6IGZ1bmN0aW9uIChldnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBldnQuZnJvbS5fX2RyYWdnZWRfXztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuc29ydGFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICB1bnNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1zdHViJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1zdHViJyxcclxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIEJpbmRpbmdzTWl4aW4gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3Itd2lkZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcclxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlID4ud2cud2ctcm93JyksIEJpbmRpbmdzTWl4aW4gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzdHViOiBmdW5jdGlvbigpIHsgcmV0dXJuIHN0dWIoJ0hvcmlzb250YWwgU3RhY2snLCAnRHJvcCBIZXJlJyk7IH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZScpLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc3R1YjogZnVuY3Rpb24oKSB7IHJldHVybiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKTsgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1jYW52YXMnLFxyXG4gICAgICAgIG1peGluczogWyBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZScpIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzdHViOiBmdW5jdGlvbigpIHsgcmV0dXJuIHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpOyB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kb21haW5zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRvbWFpbnMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGRvbWFpbnM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgU2hlbGwuTG9hZGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWxvYWRlcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1sb2FkZXInLFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLiRyb3V0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2UnLFxyXG4gICAgICAgIG1peGluczogWyAvKkNvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiovIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvcjogdGhpcy5kZWNvcmF0b3IsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlOiB0aGlzLnN0b3JhZ2UsXHJcbiAgICAgICAgICAgICAgICBwYWdlU2V0dGluZ3M6IHt9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9ICdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJztcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2UucmVzb3VyY2UnLCAocmVzb3VyY2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncGFnZVNldHRpbmdzLndpZHRoJywgJzk2MHB4Jyk7IC8vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocGFyYW0gaW4gcmVzb3VyY2UucGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncGFnZVNldHRpbmdzLicgKyByZXNvdXJjZS5wYXJhbXNbcGFyYW1dLm5hbWUsIHJlc291cmNlLnBhcmFtc1twYXJhbV0udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0b3JhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3QgPSBzdG9yYWdlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZVtzdC5uYW1lXSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdC52YXJpYWJsZXMubGVuZ3RoOyBqKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBzdC52YXJpYWJsZXNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yYWdlW3N0Lm5hbWVdW3ZhcmlhYmxlLm5hbWVdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBydW50aW1lLmV2YWx1YXRlKHRoaXMsIHZhcmlhYmxlLmJpbmRpbmcsIHZhcmlhYmxlLnZhbHVlKSB8fCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3N0b3JhZ2UnLCBzdG9yYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucHVzaCh0aGlzLmRvUmVxdWVzdChzb3VyY2VzW2ldKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmZXJyZWQubGVuZ3RoID4gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJC53aGVuLmFwcGx5KHRoaXMsIGRlZmVycmVkKS5kb25lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzb3VyY2VzW2ldLm5hbWVdID0gYXJndW1lbnRzW2ldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdkYXRhJywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVmZXJyZWQubGVuZ3RoID09IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkWzBdLmRvbmUoZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbc291cmNlc1swXS5uYW1lXSA9IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2RhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZG9SZXF1ZXN0OiBmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5wYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBzLnBhcmFtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uaW4gPT0gJ3F1ZXJ5JyAmJiBwYXJhbS5zcGVjaWZpZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtLmJpbmRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuJGludGVycG9sYXRlKHBhcmFtLmJpbmRpbmcpIC8vIFRPRE8gSW50ZXJwb2xhdGUgaW4gcGFnZSBjb250ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXJhbS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlbcGFyYW0ubmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBzLm1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHMudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBxdWVyeSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwYWdlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIFBhbGV0dGVJdGVtID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUtaXRlbScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlLWl0ZW0nLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgICAgICB0aHVtYm5haWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvYnVuZGxlcy8nICsgdGhpcy53aWRnZXQucHJvdmlkZXIuYWxpYXMgKyAnLycgKyB0aGlzLndpZGdldC50aHVtYm5haWwucGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUodGhpcy4kZWwsIHtcclxuICAgICAgICAgICAgICAgIGdyb3VwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3dpZGdldHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHB1bGw6ICdjbG9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHV0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG4gICAgICAgICAgICAgICAgc29ydDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBvblN0YXJ0OiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhldnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICQoZXZ0Lml0ZW0pLmh0bWwoJzxiPkRhdGE8L2I+Jyk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyBzZXREYXRhOiBmdW5jdGlvbiAoZGF0YVRyYW5zZmVyLCBkcmFnRWwpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkcmFnRWwpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICQoZHJhZ0VsKS5odG1sKCc8Yj5IZWxsbzwvYj4nKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBkYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGRyYWdFbC50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgICAgICAgLy8gc2V0RGF0YTogZnVuY3Rpb24oZGF0YVRyYW5zZmVyLCBkcmFnRWwpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBkYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGRyYWdFbC50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyAkKHRoaXMuJGVsKS5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICAvLyAgICAgY29ubmVjdFRvU29ydGFibGU6IFwiLmdlLmdlLXN0YWNrZWRcIixcclxuICAgICAgICAgICAgLy8gICAgIGhlbHBlcjogXCJjbG9uZVwiLFxyXG4gICAgICAgICAgICAvLyAgICAgcmV2ZXJ0OiBcImludmFsaWRcIlxyXG4gICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgJ3BhbGV0dGUtaXRlbSc6IFBhbGV0dGVJdGVtXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIFNoZWxsLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBTaGVsbC5TaGVsbCA9IHtcclxuICAgICAgICAvLyBwcm9wczoge1xyXG4gICAgICAgIC8vICAgICBzZWxlY3Rpb246IE9iamVjdCxcclxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAvLyAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzLiRodHRwKHtcclxuICAgICAgICAgICAgLy8gICAgIHVybDogJycsXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLiRyb3V0ZS5wYXJhbXMuZG9tYWluKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy4kcm91dGUucGFyYW1zLnBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NoZWxsJywge1xyXG5cclxuICAgICAgICAgICAgICAgIGdldFdpZGdldDogKGlkKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5zZXR0aW5ncy53aWRnZXRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAody5pZCA9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHRoaXMuc2VsZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXHJcbiAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICBTaGVsbC5TaGVsbFB1YmxpYyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wdWJsaWMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbIFNoZWxsLlNoZWxsIF0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHVibGljJyxcclxuICAgIH0pO1xyXG5cclxuICAgIFNoZWxsLlNoZWxsUHJpdmF0ZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wcml2YXRlJywge1xyXG5cclxuICAgICAgICBtaXhpbnM6IFsgU2hlbGwuU2hlbGwgXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wcml2YXRlJyxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzLiRodHRwKClcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlbGV2YW50KGN1cnJlbnQsIGNvbGxlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnIHx8IChjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24uaW5kZXhPZihjdXJyZW50KSA8IDApKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBjb2xsZWN0aW9uW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGMuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50Ll9hY3Rpb24gPT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3NldHRpbmdzLmNhdGVnb3JpZXMnLCAoY2F0ZWdvcmllcykgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcmllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YiA9IGNhdGVnb3JpZXNbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IHN1Yi5jYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwuZG9tYWlucycsIChkb21haW5zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5kb21haW4gPSByZWxldmFudCh0aGlzLnNlbGVjdGlvbi5kb21haW4sIGRvbWFpbnMpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLnBhZ2VzJywgKHBhZ2VzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gcmVsZXZhbnQodGhpcy5zZWxlY3Rpb24ucGFnZSwgcGFnZXMpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3NlbGVjdGlvbi5wYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uc291cmNlID0gcmVsZXZhbnQodGhpcy5zZWxlY3Rpb24uc291cmNlLCBzb3VyY2VzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzZWxlY3Rpb24ucGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uc3RvcmFnZSA9IHJlbGV2YW50KHRoaXMuc2VsZWN0aW9uLnN0b3JhZ2UsIHN0b3JhZ2VzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBnZXRXaWRnZXQ6IGZ1bmN0aW9uKGlkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNldHRpbmdzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdyA9IHRoaXMuc2V0dGluZ3Mud2lkZ2V0c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAody5pZCA9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5OiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5kb21haW4gPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnBhZ2UgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdFNvdXJjZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uc291cmNlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTdG9yYWdlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5zdG9yYWdlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIFNoZWxsLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc291cmNlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIi8vIChmdW5jdGlvbigkLCBWdWUsIENvcmUsIHVuZGVmaW5lZCkge1xyXG4vL1xyXG4vLyAgICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RhY2tlZCcsIHtcclxuLy8gICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdGFja2VkJyxcclxuLy8gICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkIF1cclxuLy8gICAgIH0pO1xyXG4vL1xyXG4vLyB9KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0b3JhZ2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0b3JhZ2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzdG9yYWdlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3R1YicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdHViJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC10YXJnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtdGFyZ2V0JyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XHJcblNoZWxsLldpZGdldHMgPSB3aW5kb3cuU2hlbGwuV2lkZ2V0cyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIFNoZWxsLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBTaGVsbC5XaWRnZXQgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXdpZGdldCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIC8qIENvcmUuRGVjb3JhdG9yTWl4aW4sIENvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiwgQ29yZS5CaW5kaW5nc01peGluICovIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAnZGVmYXVsdC1zdGFjay1wYWdlJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy10YWJsZScsIHN0dWI6IHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCc6IGZ1bmN0aW9uKCkgeyBPYmplY3QuYXNzaWduKHRoaXMsIHsgc2VsZWN0b3I6ICcud2cud2ctcm93Jywgc3R1Yjogc3R1YignSG9yaXNvbnRhbCBTdGFjaycsICdEcm9wIEhlcmUnKSB9KSB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy10YWJsZScsIHN0dWI6IHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCc6ICdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnOiAnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJyxcclxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdHViJzogJ3NoZWxsLWRlY29yYXRvci1zdHViJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmYWxsYmFjazogJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3dpZGdldCcpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNoZWxsID0gVnVlLnNlcnZpY2UoJ3NoZWxsJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLndpZGdldCA9IHNoZWxsLmdldFdpZGdldCh0aGlzLm1vZGVsLnR5cGUpO1xyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9IHRoaXMuZGVjb3JhdG9ycy5hbHRlcm5hdGl2ZXNbdGhpcy53aWRnZXQudGFnXSB8fCB0aGlzLmRlY29yYXRvcnMuZmFsbGJhY2s7XG5cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy4kcm91dGUpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmRlY29yYXRvciA9ICdzaGVsbC1kZWNvcmF0b3Itc3R1Yic7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0LFxyXG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmRlY29yYXRvcixcclxuICAgICAgICAgICAgICAgIC8vIGl0ZW1zOiB0aGlzLndpZGdldHMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIFNoZWxsKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
