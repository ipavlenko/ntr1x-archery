(function($, Vue, undefined) {

    $(document).ready(function() {

        $('[data-vue]').each(function(index, element) {

            new Vue({
                el: element,
                data: $(element).data(),
            });
        })
    });

})(jQuery, Vue);

Core = window.Core || {};

(function(Vue, $, Core) {

    Core.TabsMixin = function(active) {

        return {

            data: function() {
                return {
                    tabs: {
                        active: active
                    }
                }
            },

            methods: {

                activate: function(tab) {
                    this.tabs.active = tab;
                },

                isActive: function(tab) {
                    return this.tabs.active == tab;
                }
            }
        }
    }

    Core.ActionMixin = function(ModalEditor) {

        return {

            props: {
                model: Object,
                globals: Object
            },

            methods: {

                open: function(context) {

                    var dialog = new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context,
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

                doApply: function(model) {

                    Object.assign(this.model, JSON.parse(JSON.stringify(model)), {
                        _action: this.model._action
                            ? this.model._action
                            : 'update'
                    });

                    $(window).trigger('resize');
                }
            }
        };
    };

    Core.EditorMixin = function(ListViewer, ModalEditor) {

        return {

            props: {
                items: Array,
                globals: Object
            },

            methods: {

                trigger: function(event, item, context) {
                    this.$dispatch(event, { item: item, context: context });
                },

                create: function(item, context) {

                    var dialog = new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context,
                            original: null,
                            current: item ? JSON.parse(JSON.stringify(item)) : {}
                        },

                        methods: {
                            submit: function() {
                                this.owner.doCreate(this.current);
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

                remove: function(item, context) {
                    this.doRemove(item, context);
                },

                update: function(item, context) {

                    this.active = item;

                    new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context,
                            original: item,
                            current: JSON.parse(JSON.stringify(item))
                        },

                        methods: {
                            submit: function() {
                                this.owner.doUpdate(this.current);
                                this.$remove();
                                this.$destroy();
                            },
                            reset:  function() {
                                this.$remove();
                                this.$destroy();
                            },
                        }
                    }).$mount().$appendTo($('body').get(0));
                },

                doCreate: function(item, context) {

                    this.items.push(Object.assign({}, JSON.parse(JSON.stringify(item)), { _action: 'create' }));
                    $(window).trigger('resize');
                    this.active = null;
                },

                doUpdate: function(item, context) {

                    Object.assign(this.active, JSON.parse(JSON.stringify(item)), {
                        _action: this.active._action
                            ? this.active._action
                            : 'update'
                    });

                    this.items = $.extend(true, [], this.items);//this.items.slice();
                    $(window).trigger('resize');
                    this.active = null;
                },

                doRemove: function(item, context) {

                    var index = this.items.indexOf(item);
                    if (index !== -1) {
                        var item = this.items[index];
                        if (item._action == 'create') {
                            this.items.$remove(item);
                        } else {
                            item._action = 'remove';
                        }
                    }

                    this.items = $.extend(true, [], this.items);
                    $(window).trigger('resize');
                    this.active = null;
                }
            },

            events: {
                create: function(data) { this.create(data.item, data.context); },
                update: function(data) { this.update(data.item, data.context); },
                remove: function(data) { this.remove(data.item, data.context); },
                doCreate: function(data) { this.doCreate(data.item, data.context); },
                doUpdate: function(data) { this.doUpdate(data.item, data.context); },
                doRemove: function(data) { this.doRemove(data.item, data.context); },
            }
        };
    };

    Core.ListViewerMixin = {

        props: {
            items: Array,
            globals: Object
        },

        methods: {
            trigger: function(event, data) { this.$dispatch(event, { item: item, context: context }); },
            create: function(item, context) { this.$dispatch('create', { item: item, context: context} ); },
            update: function(item, context) { this.$dispatch('update', { item: item, context: context} ); },
            remove: function(item, context) { this.$dispatch('remove', { item: item, context: context} ); },
        }
    };

    Core.ModalEditorMixin = {

        attached: function() {

            $(this.$el).modal('show');
            $(this.$el).on('hide.bs.modal', (e) => {
                e.stopPropagation();
                this.reset();
            });
        },

        detached: function() {
            $(this.$el).modal('hide');
        },

        methods: {
            submit: function() {},
            reset: function() {}
        }
    };

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

Core = window.Core || {};

(function(Vue, $, Core) {

    Core.WidgetMixin = {

        props: {
            page: Object,
            data: Object,
            stack: Object,
            bindings: Object,
            children: Array,
            editable: Boolean,
        },

        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
    };

    Core.StackedMixin = {

        props: {
            globals: Object,
            settings: Object,
            page: Object,
            data: Object,
            editable: Boolean,
            children: Array,
        },
    };

    // Core.BindingsMixin = {
    //
    //     data: function() {
    //         return {
    //             bindings: this.bindings,
    //         };
    //     },
    //
    //     ready: function() {
    //
    //         function recur(params) {
    //
    //             var value = {};
    //
    //             for(var key in params) {
    //
    //                 if (params[key]['binding']) {
    //
    //                     value[key] = self.$interpolate(params[key]['binding']);
    //
    //                 } else if ($.isArray(params[key]['value'])) {
    //
    //                     value[key] = [];
    //
    //                     for(var i = 0; i < params[key]['value'].length; i++) {
    //                         value[key][i] = recur(params[key]['value'][i]);
    //                     }
    //
    //                 } else {
    //                     value[key] = params[key]['value'];
    //                 }
    //             }
    //
    //             return value;
    //         }
    //
    //         this.$watch('data.params', function(params) {
    //             self.bindings = recur(self.data.params);
    //         }, {
    //           deep: true,
    //           immediate: true,
    //         });
    //     }
    // }

    // Core.DecoratorMixin = {
    //
    //     ready: function() {
    //         var decorator = this.decorators[this.widget.tag];
    //         if (decorator) decorator();
    //     }
    // }

    // Core.ContainerMixin = {
    //
    //     props: {
    //         items: Array,
    //     },
    //
    //     data: function() {
    //         return {
    //             children: this.children,
    //         };
    //     },
    //
    //     ready: function() {
    //
    //         var self = this;
    //
    //         this.$watch('items', function(items) {
    //
    //             var children = [];
    //             if (items) {
    //                 for (var i = 0; i < items.length; i++) {
    //                     var item = items[i];
    //                     if (item._action != 'remove') {
    //                         children.push(item);
    //                     }
    //                 }
    //             }
    //
    //             console.log(self);
    //             if (children.length < 2) {
    //                 // console.log(self.$refs.widget, self.data, self);
    //                 // console.log(this);
    //                 // if (self.$refs.widget) {
    //                 // children.push(JSON.parse(JSON.stringify(self.stub)));
    //                 // }
    //             }
    //
    //             this.children = children;
    //         }, {
    //             immediate: true,
    //             deep: true,
    //         });
    //     },
    //
    //     events: {
    //         removeChildWidget: function(data) { this.doRemoveChildWidget(data.item, data.context); },
    //     },
    //
    //     methods: {
    //
    //         removeWidget: function() {
    //             this.$parent.$dispatch('removeChildWidget', { item: this.data });
    //         },
    //
    //         doRemoveChildWidget: function(item) {
    //
    //             if (item._action == 'create') {
    //                 this.items.$remove(item);
    //             } else {
    //                 item._action = 'remove';
    //             }
    //
    //             this.items = $.extend(true, [], this.items);
    //         }
    //     },
    // };

    // Core.SortableMixin = {
    //
    //     data: function() {
    //
    //         return {
    //             selected: this.selected,
    //         };
    //     },
    //
    //     ready: function() {
    //
    //         var self = this;
    //
    //         this.$watch('selected', function(selected) {
    //
    //             if (selected) {
    //
    //                 self.sortable =
    //                 Sortable.create($(self.selector, this.$el).get(0), {
    //                     group: {
    //                         name: 'widgets',
    //                     },
    //                     animation: 150,
    //
    //                     onAdd: function (evt) {
    //
    //                         var palette = $(evt.item).closest('.ge.ge-palette');
    //
    //                         if (!palette.length) {
    //                             $(evt.item).remove();
    //
    //                             var i = find(self.items, evt.newIndex);
    //
    //                             var widget = self.$root.$refs.shell.getWidget($(evt.item).data('widget'));
    //
    //                             self.items.splice(i.index, 0, {
    //                                 type: widget.id,
    //                                 resource: {
    //                                     params: [],
    //                                     _action: 'create'
    //                                 },
    //                                 params: widget.params
    //                                     ? JSON.parse(JSON.stringify(widget.params))
    //                                     : {}
    //                                 ,
    //                                 _action: 'create',
    //                             });
    //
    //                             self.items = $.extend(true, [], self.items);
    //                         }
    //                     },
    //
    //                     onEnd: function (evt) {
    //
    //                         if  (evt.newIndex != evt.oldIndex) {
    //
    //                             evt.preventDefault();
    //
    //                             var oi = find(self.items, evt.oldIndex);
    //                             var ni = find(self.items, evt.newIndex);
    //
    //                             self.items.splice(ni.index, 0, self.items.splice(oi.index, 1)[0]);
    //                         }
    //
    //                         self.items = $.extend(true, [], self.items);
    //                     }
    //                 });
    //
    //             } else {
    //
    //                 if (self.sortable) {
    //                     self.sortable.destroy();
    //                     self.sortable = null;
    //                 }
    //             }
    //         }, {
    //             immediate: true
    //         });
    //     },
    //
    //     methods: {
    //         selectTarget: function() {
    //             this.selected = true;
    //         },
    //
    //         unselectTarget: function() {
    //             this.selected = false;
    //         },
    //     }
    // };

})(Vue, jQuery, Core, undefined);

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

Vue.directive('rich', {

    bind: function () {

        if (window.CKEDITOR) {

            this.editor = CKEDITOR.inline(this.el, {
                stylesSet: [
                    { name: 'Bolder', element: 'span', attributes: { 'class': 'extrabold'} }
                ],
                toolbarGroups: [
                    // { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                    // { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
                    { name: 'links' },
                    // { name: 'forms' },
                    {name: 'tools'},
                    {name: 'document', groups: ['mode', 'document', 'doctools']},
                    {name: 'others'},
                    {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
                    {name: 'colors'},
                    '/',
                    {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                    {name: 'styles'},
                    '/',
                    { name: 'insert', groups: [ 'ImageButton' ]  }
                    //{name: 'about'}
                ]
            });

            this.editor.on('change', function() {
                this.editor.updateElement();
                this.vm.$set(this.expression, $(this.el).val());
            }.bind(this));

            this.editor.setData(this.vm.$get(this.expression));
        }
    },

    update: function (newValue, oldValue) {
        // console.log('update', newValue, oldValue);
    },

    unbind: function () {
        this.editor.destroy();
        this.editor = null;
        this.textarea = null;
        this.input = null;
    }
});

Vue.directive('scrollable', {

    bind: function () {

        $(this.el).css({
            'overflow': 'auto',
        });

        // if ($.fn.mCustomScrollbar) {
        //     Vue.nextTick(function() {
        //         $(this.el).mCustomScrollbar({
        //             axis: this.expression
        //         });
        //     }.bind(this));
        // }

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

Vue.filter('jsonPath', function (context, str) {
    var re = /{([^}]+)}/g;
    try {
        return str.replace(re, function(match, expr) {
            return JSONPath({
                json: context,
                path: expr
            });
        });
    } catch (e) {
        return 'Bad Expression';
    }
});


Vue.filter('binding', function (data) {

	console.log(data);
	console.log('param = get binding value from data');
	console.log('get param from global scope');

    // for example, binding param is "{{ 'asd' }}"
    // that's mean 'asd' must be concatiname with value.

    // If value is 'QWE' and binding param is 'asd', result will be QWEasd

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

        $(window).on('resize', () => {
            $('.modal.modal-center:visible').each(function(index, element) {
                reposition(element);
            });
        });
    });

})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZ1ZS5qcyIsImNvbXBvbmVudHMvZWRpdG9yLmpzIiwiY29tcG9uZW50cy9mb3JtLmpzIiwiY29tcG9uZW50cy9ncmlkLmpzIiwiY29tcG9uZW50cy9pbmxpbmUuanMiLCJjb21wb25lbnRzL21peGlucy5qcyIsImNvbXBvbmVudHMvbW9kYWwuanMiLCJjbGllbnQvY2xpZW50LmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvcmljaC5qcyIsImRpcmVjdGl2ZXMvc2Nyb2xsYWJsZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJob29rcy9tb2RhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdnVlXScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIG5ldyBWdWUoe1xyXG4gICAgICAgICAgICAgICAgZWw6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiAkKGVsZW1lbnQpLmRhdGEoKSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCJDb3JlID0gd2luZG93LkNvcmUgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgQ29yZS5UYWJzTWl4aW4gPSBmdW5jdGlvbihhY3RpdmUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogYWN0aXZlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnMuYWN0aXZlID0gdGFiO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFicy5hY3RpdmUgPT0gdGFiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIENvcmUuQWN0aW9uTWl4aW4gPSBmdW5jdGlvbihNb2RhbEVkaXRvcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcGVuOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLkVkaXRvck1peGluID0gZnVuY3Rpb24oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogaXRlbSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpIDoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0NyZWF0ZSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUmVtb3ZlKGl0ZW0sIGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBpdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvVXBkYXRlKHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7IF9hY3Rpb246ICdjcmVhdGUnIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuYWN0aXZlLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5jcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMudXBkYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLnJlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICBkb0NyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvQ3JlYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9VcGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1JlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLkxpc3RWaWV3ZXJNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7IHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7IH0sXHJcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgnY3JlYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxyXG4gICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3VwZGF0ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcclxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdyZW1vdmUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLk1vZGFsRWRpdG9yTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm9uKCdoaWRlLmJzLm1vZGFsJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRldGFjaGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7fSxcclxuICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge31cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ3YtZm9ybScsIHtcclxuXHJcblx0cHJvcHM6IHtcclxuXHRcdGFjdGlvbjogU3RyaW5nLFxyXG5cdFx0bWV0aG9kOiBTdHJpbmcsXHJcblx0XHRpbml0OiBPYmplY3QsXHJcblx0XHRkb25lOiBGdW5jdGlvbixcclxuXHRcdGZhaWw6IEZ1bmN0aW9uLFxyXG5cdFx0bW9kZWw6IE9iamVjdCxcclxuXHR9LFxyXG5cclxuXHQvLyByZXBsYWNlOiBmYWxzZSxcclxuXHJcblx0Ly8gdGVtcGxhdGU6IGBcclxuXHQvLyBcdDxmb3JtPlxyXG5cdC8vIFx0XHQ8c2xvdD48L3Nsb3Q+XHJcblx0Ly8gXHQ8L2Zvcm0+XHJcblx0Ly8gYCxcclxuXHJcblx0YWN0aXZhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcclxuXHJcblx0XHR0aGlzLm9yaWdpbmFsID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSk7XHJcblxyXG5cdFx0JCh0aGlzLiRlbClcclxuXHJcblx0XHRcdC5vbignc3VibWl0JywgKGUpID0+IHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0dGhpcy5zdWJtaXQoKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0Lm9uKCdyZXNldCcsIChlKSA9PiB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRkb25lKCk7XHJcblx0fSxcclxuXHJcblx0ZGF0YTogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWxcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblx0bWV0aG9kczoge1xyXG5cclxuXHRcdHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHQvLyBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1vZGVsKTtcclxuXHJcblx0XHRcdCQuYWpheCh7XHJcblx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcclxuXHRcdFx0XHRtZXRob2Q6IHRoaXMubWV0aG9kLFxyXG5cdFx0XHRcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZG9uZSgoZCkgPT4ge1xyXG5cdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmZhaWwoZnVuY3Rpb24oZSkgeyBpZiAoZmFpbCBpbiB0aGlzKSB0aGlzLmZhaWwoZSk7IH0uYmluZCh0aGlzKSlcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIHRoaXMub3JpZ2luYWwpO1xyXG5cdFx0fVxyXG5cdH0sXHJcbn0pOyIsIihmdW5jdGlvbigkLCBWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuXHQvLyB2YXIgbW9kZWwgPSB7XHJcblx0Ly8gXHRsaXN0OiBbXVxyXG5cdC8vIH07XHJcblx0Ly9cclxuXHQvLyB2YXIgYm9keSA9IFZ1ZS5leHRlbmQoe1xyXG5cdC8vIFx0Y3JlYXRlZDogZnVuY3Rpb24oKSAgeyB0aGlzLiRkaXNwYXRjaCgncmVnaXN0ZXItYm9keScsIHRoaXMpIH0sXHJcblx0Ly8gfSk7XHJcblxyXG5cdFZ1ZS5jb21wb25lbnQoJ2dyaWQtdGFibGUnLCB7XHJcblxyXG5cdFx0cmVwbGFjZTogZmFsc2UsXHJcblxyXG5cdFx0cHJvcHM6IHtcclxuXHRcdFx0ZDogQXJyYXlcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gZGF0YTogZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBcdHJldHVybiB7XHJcblx0XHQvLyBcdFx0aXRlbXM6IHRoaXMuZC5zbGljZSgwKVxyXG5cdFx0Ly8gXHR9XHJcblx0XHQvLyB9LFxyXG5cclxuXHRcdG1ldGhvZHM6IHtcclxuXHJcblx0XHRcdGFkZDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FzZGFzZCcpO1xyXG5cdFx0XHRcdHRoaXMuaXRlbXMucHVzaCh7fSk7XHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5pdGVtcyk7XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCJWdWUuY29tcG9uZW50KCdpbmxpbmUtdGV4dCcsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS1jaGVja2JveCcsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNoZWNrYm94XCIgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLXNlbGVjdCcsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cclxuXHRcdFx0XHRcdDxvcHRpb24gdi1mb3I9XCJvcHRpb24gaW4gb3B0aW9uc1wiIHZhbHVlPVwie3sgb3B0aW9uLmtleSB9fVwiPnt7IG9wdGlvbi52YWx1ZSB9fTwvb3B0aW9uPlxyXG5cdFx0XHRcdDwvc2VsZWN0PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLXZhbHVlJyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ2NsYXNzJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDxzcGFuIDpjbGFzcz1cImNsYXNzXCI+e3sgdmFsdWUgfX08L3NwYW4+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIENvcmUuV2lkZ2V0TWl4aW4gPSB7XHJcblxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLlN0YWNrZWRNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDb3JlLkJpbmRpbmdzTWl4aW4gPSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4ge1xyXG4gICAgLy8gICAgICAgICAgICAgYmluZGluZ3M6IHRoaXMuYmluZGluZ3MsXHJcbiAgICAvLyAgICAgICAgIH07XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgZnVuY3Rpb24gcmVjdXIocGFyYW1zKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gcGFyYW1zKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChwYXJhbXNba2V5XVsnYmluZGluZyddKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gc2VsZi4kaW50ZXJwb2xhdGUocGFyYW1zW2tleV1bJ2JpbmRpbmcnXSk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJC5pc0FycmF5KHBhcmFtc1trZXldWyd2YWx1ZSddKSkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IFtdO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBhcmFtc1trZXldWyd2YWx1ZSddLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldW2ldID0gcmVjdXIocGFyYW1zW2tleV1bJ3ZhbHVlJ11baV0pO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBwYXJhbXNba2V5XVsndmFsdWUnXTtcclxuICAgIC8vICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLiR3YXRjaCgnZGF0YS5wYXJhbXMnLCBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgIC8vICAgICAgICAgICAgIHNlbGYuYmluZGluZ3MgPSByZWN1cihzZWxmLmRhdGEucGFyYW1zKTtcclxuICAgIC8vICAgICAgICAgfSwge1xyXG4gICAgLy8gICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAvLyAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gQ29yZS5EZWNvcmF0b3JNaXhpbiA9IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICB2YXIgZGVjb3JhdG9yID0gdGhpcy5kZWNvcmF0b3JzW3RoaXMud2lkZ2V0LnRhZ107XHJcbiAgICAvLyAgICAgICAgIGlmIChkZWNvcmF0b3IpIGRlY29yYXRvcigpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyBDb3JlLkNvbnRhaW5lck1peGluID0ge1xyXG4gICAgLy9cclxuICAgIC8vICAgICBwcm9wczoge1xyXG4gICAgLy8gICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiB7XHJcbiAgICAvLyAgICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5jaGlsZHJlbixcclxuICAgIC8vICAgICAgICAgfTtcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLiR3YXRjaCgnaXRlbXMnLCBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGl0ZW0pO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA8IDIpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzZWxmLiRyZWZzLndpZGdldCwgc2VsZi5kYXRhLCBzZWxmKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi4kcmVmcy53aWRnZXQpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAvLyBjaGlsZHJlbi5wdXNoKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VsZi5zdHViKSkpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIH1cclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAvLyAgICAgICAgIH0sIHtcclxuICAgIC8vICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgIC8vICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGV2ZW50czoge1xyXG4gICAgLy8gICAgICAgICByZW1vdmVDaGlsZFdpZGdldDogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvUmVtb3ZlQ2hpbGRXaWRnZXQoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIG1ldGhvZHM6IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLiRwYXJlbnQuJGRpc3BhdGNoKCdyZW1vdmVDaGlsZFdpZGdldCcsIHsgaXRlbTogdGhpcy5kYXRhIH0pO1xyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgZG9SZW1vdmVDaGlsZFdpZGdldDogZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XHJcbiAgICAvLyAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9LFxyXG4gICAgLy8gfTtcclxuXHJcbiAgICAvLyBDb3JlLlNvcnRhYmxlTWl4aW4gPSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkLFxyXG4gICAgLy8gICAgICAgICB9O1xyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuJHdhdGNoKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKHNlbGVjdGVkKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUgPVxyXG4gICAgLy8gICAgICAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSgkKHNlbGYuc2VsZWN0b3IsIHRoaXMuJGVsKS5nZXQoMCksIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3aWRnZXRzJyxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBvbkFkZDogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYWxldHRlID0gJChldnQuaXRlbSkuY2xvc2VzdCgnLmdlLmdlLXBhbGV0dGUnKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBhbGV0dGUubGVuZ3RoKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChldnQuaXRlbSkucmVtb3ZlKCk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gc2VsZi4kcm9vdC4kcmVmcy5zaGVsbC5nZXRXaWRnZXQoJChldnQuaXRlbSkuZGF0YSgnd2lkZ2V0JykpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShpLmluZGV4LCAwLCB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5pZCxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHdpZGdldC5wYXJhbXNcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3aWRnZXQucGFyYW1zKSlcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoge31cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCBzZWxmLml0ZW1zKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIG9uRW5kOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgaWYgIChldnQubmV3SW5kZXggIT0gZXZ0Lm9sZEluZGV4KSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2kgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5vbGRJbmRleCk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaS5pbmRleCwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2kuaW5kZXgsIDEpWzBdKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHNlbGYuaXRlbXMpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKHNlbGYuc29ydGFibGUpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZS5kZXN0cm95KCk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUgPSBudWxsO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfSwge1xyXG4gICAgLy8gICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIG1ldGhvZHM6IHtcclxuICAgIC8vICAgICAgICAgc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdW5zZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy8gICAgIH1cclxuICAgIC8vIH07XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiVnVlLmNvbXBvbmVudCgnbW9kYWwnLCB7XHJcblxyXG4gICAgcHJvcHM6IHtcclxuICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgIGN1cnJlbnQ6IE9iamVjdCxcclxuICAgICAgICBvcmlnaW5hbDogT2JqZWN0LFxyXG4gICAgfSxcclxuXHJcbiAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgnc3VibWl0JywgdGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLm9yaWdpbmFsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuY3VycmVudCkpKTtcclxuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZXNldDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVzZXQnLCB0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMuY3VycmVudCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9yaWdpbmFsKSkpO1xyXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbiIsIiIsIlZ1ZS5kaXJlY3RpdmUoJ2NvbWJvJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLnNlbGVjdDIoe1xyXG5cdFx0XHRcdHRhZ3M6IHRydWUsXHJcblx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxyXG5cdFx0XHRcdGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0aWQ6IHBhcmFtcy50ZXJtLFxyXG5cdFx0XHRcdFx0XHR0ZXh0OiBwYXJhbXMudGVybSxcclxuXHRcdFx0XHRcdFx0bmV3T3B0aW9uOiB0cnVlXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ2RhdGUnLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFxyXG5cdFx0aWYgKCQuZm4uZGF0ZXBpY2tlcikge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS5kYXRlcGlja2VyKHtcclxuXHRcdFx0XHRhdXRvY2xvc2U6IHRydWUsXHJcblx0XHRcdFx0dG9kYXlIaWdobGlnaHQ6IHRydWUsXHJcblx0XHRcdFx0Zm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgncmljaCcsIHtcclxuXHJcbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cuQ0tFRElUT1IpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yID0gQ0tFRElUT1IuaW5saW5lKHRoaXMuZWwsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1NldDogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0JvbGRlcicsIGVsZW1lbnQ6ICdzcGFuJywgYXR0cmlidXRlczogeyAnY2xhc3MnOiAnZXh0cmFib2xkJ30gfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHRvb2xiYXJHcm91cHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdjbGlwYm9hcmQnLCAgIGdyb3VwczogWyAnY2xpcGJvYXJkJywgJ3VuZG8nIF0gfSxcclxuICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdlZGl0aW5nJywgICAgIGdyb3VwczogWyAnZmluZCcsICdzZWxlY3Rpb24nLCAnc3BlbGxjaGVja2VyJyBdIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGlua3MnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZm9ybXMnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICd0b29scyd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnZG9jdW1lbnQnLCBncm91cHM6IFsnbW9kZScsICdkb2N1bWVudCcsICdkb2N0b29scyddfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ290aGVycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAncGFyYWdyYXBoJywgZ3JvdXBzOiBbJ2xpc3QnLCAnaW5kZW50JywgJ2Jsb2NrcycsICdhbGlnbiddfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2NvbG9ycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgICcvJyxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2Jhc2ljc3R5bGVzJywgZ3JvdXBzOiBbJ2Jhc2ljc3R5bGVzJywgJ2NsZWFudXAnXX0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdzdHlsZXMnfSxcclxuICAgICAgICAgICAgICAgICAgICAnLycsXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaW5zZXJ0JywgZ3JvdXBzOiBbICdJbWFnZUJ1dHRvbicgXSAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8ve25hbWU6ICdhYm91dCd9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IudXBkYXRlRWxlbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52bS4kc2V0KHRoaXMuZXhwcmVzc2lvbiwgJCh0aGlzLmVsKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXREYXRhKHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVkaXRvci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGV4dGFyZWEgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBudWxsO1xyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgnc2Nyb2xsYWJsZScsIHtcclxuXHJcbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICQodGhpcy5lbCkuY3NzKHtcclxuICAgICAgICAgICAgJ292ZXJmbG93JzogJ2F1dG8nLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBpZiAoJC5mbi5tQ3VzdG9tU2Nyb2xsYmFyKSB7XHJcbiAgICAgICAgLy8gICAgIFZ1ZS5uZXh0VGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyAgICAgICAgICQodGhpcy5lbCkubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgYXhpczogdGhpcy5leHByZXNzaW9uXHJcbiAgICAgICAgLy8gICAgICAgICB9KTtcclxuICAgICAgICAvLyAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgfSxcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgfSxcclxuICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgndGFncycsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS50YWdzaW5wdXQoe1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmZpbHRlcignanNvblBhdGgnLCBmdW5jdGlvbiAoY29udGV4dCwgc3RyKSB7XHJcbiAgICB2YXIgcmUgPSAveyhbXn1dKyl9L2c7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGV4cHIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT05QYXRoKHtcclxuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBleHByXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiAnQmFkIEV4cHJlc3Npb24nO1xyXG4gICAgfVxyXG59KTtcclxuXHJcblxyXG5WdWUuZmlsdGVyKCdiaW5kaW5nJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcblx0Y29uc29sZS5sb2coZGF0YSk7XHJcblx0Y29uc29sZS5sb2coJ3BhcmFtID0gZ2V0IGJpbmRpbmcgdmFsdWUgZnJvbSBkYXRhJyk7XHJcblx0Y29uc29sZS5sb2coJ2dldCBwYXJhbSBmcm9tIGdsb2JhbCBzY29wZScpO1xyXG5cclxuICAgIC8vIGZvciBleGFtcGxlLCBiaW5kaW5nIHBhcmFtIGlzIFwie3sgJ2FzZCcgfX1cIlxyXG4gICAgLy8gdGhhdCdzIG1lYW4gJ2FzZCcgbXVzdCBiZSBjb25jYXRpbmFtZSB3aXRoIHZhbHVlLlxyXG5cclxuICAgIC8vIElmIHZhbHVlIGlzICdRV0UnIGFuZCBiaW5kaW5nIHBhcmFtIGlzICdhc2QnLCByZXN1bHQgd2lsbCBiZSBRV0Vhc2RcclxuXHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignYXNzaWduJywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMykge1xyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2NvcHknLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVnVlKHtcclxuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG5cdFx0XHQ6IG51bGxcclxuXHR9KS4kZGF0YTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdjbG9uZScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWdWUoe1xyXG5cdFx0ZGF0YTogc291cmNlICE9IG51bGxcclxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXHJcblx0XHRcdDogbnVsbFxyXG5cdH0pLiRkYXRhO1xyXG59KTtcclxuXHJcbiIsIihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICQoJy5tb2RhbC5tb2RhbC1jZW50ZXI6dmlzaWJsZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJlcG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnkpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
