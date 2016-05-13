(function($, Vue, undefined) {

    $(document).ready(function() {

        $('[data-vue]').each(function(index, element) {

            new Vue({
                el: $('[data-vue-body]', element).get(0),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZ1ZS5qcyIsImNsaWVudC9jbGllbnQuanMiLCJjb21wb25lbnRzL2VkaXRvci5qcyIsImNvbXBvbmVudHMvZm9ybS5qcyIsImNvbXBvbmVudHMvZ3JpZC5qcyIsImNvbXBvbmVudHMvaW5saW5lLmpzIiwiY29tcG9uZW50cy9taXhpbnMuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiZmlsdGVycy9pbmRleC5qcyIsImRpcmVjdGl2ZXMvY29tYm8uanMiLCJkaXJlY3RpdmVzL2RhdGUuanMiLCJkaXJlY3RpdmVzL3JpY2guanMiLCJkaXJlY3RpdmVzL3Njcm9sbGFibGUuanMiLCJkaXJlY3RpdmVzL3RhZ3MuanMiLCJob29rcy9tb2RhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdnVlXScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIG5ldyBWdWUoe1xyXG4gICAgICAgICAgICAgICAgZWw6ICQoJ1tkYXRhLXZ1ZS1ib2R5XScsIGVsZW1lbnQpLmdldCgwKSxcclxuICAgICAgICAgICAgICAgIGRhdGE6ICQoZWxlbWVudCkuZGF0YSgpLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIiIsIkNvcmUgPSB3aW5kb3cuQ29yZSB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICBDb3JlLlRhYnNNaXhpbiA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiBhY3RpdmVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uKHRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFicy5hY3RpdmUgPSB0YWI7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YWJzLmFjdGl2ZSA9PSB0YWI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQ29yZS5BY3Rpb25NaXhpbiA9IGZ1bmN0aW9uKE1vZGFsRWRpdG9yKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBNb2RhbEVkaXRvcih7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwpKSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLm1vZGVsLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIENvcmUuRWRpdG9yTWl4aW4gPSBmdW5jdGlvbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBpdGVtID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSkgOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQ3JlYXRlKHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9SZW1vdmUoaXRlbSwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGl0ZW07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RhbEVkaXRvcih7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9VcGRhdGUodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6ICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb0NyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goT2JqZWN0LmFzc2lnbih7fSwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHsgX2FjdGlvbjogJ2NyZWF0ZScgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hY3RpdmUsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMuYWN0aXZlLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmUuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpOy8vdGhpcy5pdGVtcy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGRvUmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmNyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy51cGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMucmVtb3ZlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9DcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgZG9VcGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1VwZGF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvUmVtb3ZlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIENvcmUuTGlzdFZpZXdlck1peGluID0ge1xyXG5cclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHsgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTsgfSxcclxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdjcmVhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXHJcbiAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgndXBkYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxyXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIENvcmUuTW9kYWxFZGl0b3JNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICAgJCh0aGlzLiRlbCkub24oJ2hpZGUuYnMubW9kYWwnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGV0YWNoZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHt9LFxyXG4gICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7fVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiVnVlLmNvbXBvbmVudCgndi1mb3JtJywge1xyXG5cclxuXHRwcm9wczoge1xyXG5cdFx0YWN0aW9uOiBTdHJpbmcsXHJcblx0XHRtZXRob2Q6IFN0cmluZyxcclxuXHRcdGluaXQ6IE9iamVjdCxcclxuXHRcdGRvbmU6IEZ1bmN0aW9uLFxyXG5cdFx0ZmFpbDogRnVuY3Rpb24sXHJcblx0XHRtb2RlbDogT2JqZWN0LFxyXG5cdH0sXHJcblxyXG5cdC8vIHJlcGxhY2U6IGZhbHNlLFxyXG5cclxuXHQvLyB0ZW1wbGF0ZTogYFxyXG5cdC8vIFx0PGZvcm0+XHJcblx0Ly8gXHRcdDxzbG90Pjwvc2xvdD5cclxuXHQvLyBcdDwvZm9ybT5cclxuXHQvLyBgLFxyXG5cclxuXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xyXG5cclxuXHRcdHRoaXMub3JpZ2luYWwgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKTtcclxuXHJcblx0XHQkKHRoaXMuJGVsKVxyXG5cclxuXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLnN1Ym1pdCgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQub24oJ3Jlc2V0JywgKGUpID0+IHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdGRvbmUoKTtcclxuXHR9LFxyXG5cclxuXHRkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHRtZXRob2RzOiB7XHJcblxyXG5cdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubW9kZWwpO1xyXG5cclxuXHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHR1cmw6IHRoaXMuYWN0aW9uLFxyXG5cdFx0XHRcdG1ldGhvZDogdGhpcy5tZXRob2QsXHJcblx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG5cdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpXHJcblx0XHRcdH0pXHJcblx0XHRcdC5kb25lKChkKSA9PiB7XHJcblx0XHRcdFx0aWYgKGRvbmUgaW4gdGhpcykgdGhpcy5kb25lKGQpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxyXG5cdFx0fSxcclxuXHJcblx0XHRyZXNldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgdGhpcy5vcmlnaW5hbCk7XHJcblx0XHR9XHJcblx0fSxcclxufSk7IiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG5cdC8vIHZhciBtb2RlbCA9IHtcclxuXHQvLyBcdGxpc3Q6IFtdXHJcblx0Ly8gfTtcclxuXHQvL1xyXG5cdC8vIHZhciBib2R5ID0gVnVlLmV4dGVuZCh7XHJcblx0Ly8gXHRjcmVhdGVkOiBmdW5jdGlvbigpICB7IHRoaXMuJGRpc3BhdGNoKCdyZWdpc3Rlci1ib2R5JywgdGhpcykgfSxcclxuXHQvLyB9KTtcclxuXHJcblx0VnVlLmNvbXBvbmVudCgnZ3JpZC10YWJsZScsIHtcclxuXHJcblx0XHRyZXBsYWNlOiBmYWxzZSxcclxuXHJcblx0XHRwcm9wczoge1xyXG5cdFx0XHRkOiBBcnJheVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHRcdC8vIFx0cmV0dXJuIHtcclxuXHRcdC8vIFx0XHRpdGVtczogdGhpcy5kLnNsaWNlKDApXHJcblx0XHQvLyBcdH1cclxuXHRcdC8vIH0sXHJcblxyXG5cdFx0bWV0aG9kczoge1xyXG5cclxuXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnYXNkYXNkJyk7XHJcblx0XHRcdFx0dGhpcy5pdGVtcy5wdXNoKHt9KTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLml0ZW1zKTtcclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcclxuXHRcdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0fSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ2lubGluZS10ZXh0JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLWNoZWNrYm94JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtc2VsZWN0JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ29wdGlvbnMnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxzZWxlY3QgY2xhc3M9XCJpbmxpbmUtY29udHJvbDFcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiPlxyXG5cdFx0XHRcdFx0PG9wdGlvbiB2LWZvcj1cIm9wdGlvbiBpbiBvcHRpb25zXCIgdmFsdWU9XCJ7eyBvcHRpb24ua2V5IH19XCI+e3sgb3B0aW9uLnZhbHVlIH19PC9vcHRpb24+XHJcblx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnY2xhc3MnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PHNwYW4gOmNsYXNzPVwiY2xhc3NcIj57eyB2YWx1ZSB9fTwvc3Bhbj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG4iLCJDb3JlID0gd2luZG93LkNvcmUgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgQ29yZS5XaWRnZXRNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBBcnJheSxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIENvcmUuU3RhY2tlZE1peGluID0ge1xyXG5cclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENvcmUuQmluZGluZ3NNaXhpbiA9IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiB7XHJcbiAgICAvLyAgICAgICAgICAgICBiaW5kaW5nczogdGhpcy5iaW5kaW5ncyxcclxuICAgIC8vICAgICAgICAgfTtcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICBmdW5jdGlvbiByZWN1cihwYXJhbXMpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICBmb3IodmFyIGtleSBpbiBwYXJhbXMpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKHBhcmFtc1trZXldWydiaW5kaW5nJ10pIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBzZWxmLiRpbnRlcnBvbGF0ZShwYXJhbXNba2V5XVsnYmluZGluZyddKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgkLmlzQXJyYXkocGFyYW1zW2tleV1bJ3ZhbHVlJ10pKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gW107XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGFyYW1zW2tleV1bJ3ZhbHVlJ10ubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV1baV0gPSByZWN1cihwYXJhbXNba2V5XVsndmFsdWUnXVtpXSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IHBhcmFtc1trZXldWyd2YWx1ZSddO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuJHdhdGNoKCdkYXRhLnBhcmFtcycsIGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgLy8gICAgICAgICAgICAgc2VsZi5iaW5kaW5ncyA9IHJlY3VyKHNlbGYuZGF0YS5wYXJhbXMpO1xyXG4gICAgLy8gICAgICAgICB9LCB7XHJcbiAgICAvLyAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgIC8vICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyBDb3JlLkRlY29yYXRvck1peGluID0ge1xyXG4gICAgLy9cclxuICAgIC8vICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIHZhciBkZWNvcmF0b3IgPSB0aGlzLmRlY29yYXRvcnNbdGhpcy53aWRnZXQudGFnXTtcclxuICAgIC8vICAgICAgICAgaWYgKGRlY29yYXRvcikgZGVjb3JhdG9yKCk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIENvcmUuQ29udGFpbmVyTWl4aW4gPSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHByb3BzOiB7XHJcbiAgICAvLyAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuLFxyXG4gICAgLy8gICAgICAgICB9O1xyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuJHdhdGNoKCdpdGVtcycsIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoaXRlbXMpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goaXRlbSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZik7XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIDwgMikge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGYuJHJlZnMud2lkZ2V0LCBzZWxmLmRhdGEsIHNlbGYpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLiRyZWZzLndpZGdldCkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIGNoaWxkcmVuLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzZWxmLnN0dWIpKSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgIC8vICAgICAgICAgfSwge1xyXG4gICAgLy8gICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgLy8gICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgZXZlbnRzOiB7XHJcbiAgICAvLyAgICAgICAgIHJlbW92ZUNoaWxkV2lkZ2V0OiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9SZW1vdmVDaGlsZFdpZGdldChkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgbWV0aG9kczoge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgcmVtb3ZlV2lkZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuJHBhcmVudC4kZGlzcGF0Y2goJ3JlbW92ZUNoaWxkV2lkZ2V0JywgeyBpdGVtOiB0aGlzLmRhdGEgfSk7XHJcbiAgICAvLyAgICAgICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICBkb1JlbW92ZUNoaWxkV2lkZ2V0OiBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcclxuICAgIC8vICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvLyB9O1xyXG5cclxuICAgIC8vIENvcmUuU29ydGFibGVNaXhpbiA9IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICByZXR1cm4ge1xyXG4gICAgLy8gICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc2VsZWN0ZWQsXHJcbiAgICAvLyAgICAgICAgIH07XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy4kd2F0Y2goJ3NlbGVjdGVkJywgZnVuY3Rpb24oc2VsZWN0ZWQpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZSA9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgU29ydGFibGUuY3JlYXRlKCQoc2VsZi5zZWxlY3RvciwgdGhpcy4kZWwpLmdldCgwKSwge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBncm91cDoge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3dpZGdldHMnLFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IDE1MCxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIG9uQWRkOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhbGV0dGUgPSAkKGV2dC5pdGVtKS5jbG9zZXN0KCcuZ2UuZ2UtcGFsZXR0ZScpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFsZXR0ZS5sZW5ndGgpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2dC5pdGVtKS5yZW1vdmUoKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5uZXdJbmRleCk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzZWxmLiRyb290LiRyZWZzLnNoZWxsLmdldFdpZGdldCgkKGV2dC5pdGVtKS5kYXRhKCd3aWRnZXQnKSk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMuc3BsaWNlKGkuaW5kZXgsIDAsIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0LmlkLFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogd2lkZ2V0LnBhcmFtc1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpZGdldC5wYXJhbXMpKVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB7fVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHNlbGYuaXRlbXMpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgb25FbmQ6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBpZiAgKGV2dC5uZXdJbmRleCAhPSBldnQub2xkSW5kZXgpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm9sZEluZGV4KTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmkgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5uZXdJbmRleCk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMuc3BsaWNlKG5pLmluZGV4LCAwLCBzZWxmLml0ZW1zLnNwbGljZShvaS5pbmRleCwgMSlbMF0pO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgc2VsZi5pdGVtcyk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgICAgICB9KTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zb3J0YWJsZSkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlLmRlc3Ryb3koKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZSA9IG51bGw7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICB9LCB7XHJcbiAgICAvLyAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWVcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgbWV0aG9kczoge1xyXG4gICAgLy8gICAgICAgICBzZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAvLyAgICAgICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB1bnNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAvLyAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJWdWUuY29tcG9uZW50KCdtb2RhbCcsIHtcclxuXHJcbiAgICBwcm9wczoge1xyXG4gICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgY3VycmVudDogT2JqZWN0LFxyXG4gICAgICAgIG9yaWdpbmFsOiBPYmplY3QsXHJcbiAgICB9LFxyXG5cclxuICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdzdWJtaXQnLCB0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMub3JpZ2luYWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xyXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZXNldCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5jdXJyZW50LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub3JpZ2luYWwpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmZpbHRlcignanNvblBhdGgnLCBmdW5jdGlvbiAoY29udGV4dCwgc3RyKSB7XHJcbiAgICB2YXIgcmUgPSAveyhbXn1dKyl9L2c7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGV4cHIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT05QYXRoKHtcclxuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBleHByXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiAnQmFkIEV4cHJlc3Npb24nO1xyXG4gICAgfVxyXG59KTtcclxuXHJcblxyXG5WdWUuZmlsdGVyKCdiaW5kaW5nJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcblx0Y29uc29sZS5sb2coZGF0YSk7XHJcblx0Y29uc29sZS5sb2coJ3BhcmFtID0gZ2V0IGJpbmRpbmcgdmFsdWUgZnJvbSBkYXRhJyk7XHJcblx0Y29uc29sZS5sb2coJ2dldCBwYXJhbSBmcm9tIGdsb2JhbCBzY29wZScpO1xyXG5cclxuICAgIC8vIGZvciBleGFtcGxlLCBiaW5kaW5nIHBhcmFtIGlzIFwie3sgJ2FzZCcgfX1cIlxyXG4gICAgLy8gdGhhdCdzIG1lYW4gJ2FzZCcgbXVzdCBiZSBjb25jYXRpbmFtZSB3aXRoIHZhbHVlLlxyXG5cclxuICAgIC8vIElmIHZhbHVlIGlzICdRV0UnIGFuZCBiaW5kaW5nIHBhcmFtIGlzICdhc2QnLCByZXN1bHQgd2lsbCBiZSBRV0Vhc2RcclxuXHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignYXNzaWduJywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMykge1xyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2NvcHknLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVnVlKHtcclxuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG5cdFx0XHQ6IG51bGxcclxuXHR9KS4kZGF0YTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdjbG9uZScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWdWUoe1xyXG5cdFx0ZGF0YTogc291cmNlICE9IG51bGxcclxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXHJcblx0XHRcdDogbnVsbFxyXG5cdH0pLiRkYXRhO1xyXG59KTtcclxuXHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ2NvbWJvJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLnNlbGVjdDIoe1xyXG5cdFx0XHRcdHRhZ3M6IHRydWUsXHJcblx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxyXG5cdFx0XHRcdGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0aWQ6IHBhcmFtcy50ZXJtLFxyXG5cdFx0XHRcdFx0XHR0ZXh0OiBwYXJhbXMudGVybSxcclxuXHRcdFx0XHRcdFx0bmV3T3B0aW9uOiB0cnVlXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ2RhdGUnLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFxyXG5cdFx0aWYgKCQuZm4uZGF0ZXBpY2tlcikge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS5kYXRlcGlja2VyKHtcclxuXHRcdFx0XHRhdXRvY2xvc2U6IHRydWUsXHJcblx0XHRcdFx0dG9kYXlIaWdobGlnaHQ6IHRydWUsXHJcblx0XHRcdFx0Zm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgncmljaCcsIHtcclxuXHJcbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cuQ0tFRElUT1IpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yID0gQ0tFRElUT1IuaW5saW5lKHRoaXMuZWwsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1NldDogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0JvbGRlcicsIGVsZW1lbnQ6ICdzcGFuJywgYXR0cmlidXRlczogeyAnY2xhc3MnOiAnZXh0cmFib2xkJ30gfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHRvb2xiYXJHcm91cHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdjbGlwYm9hcmQnLCAgIGdyb3VwczogWyAnY2xpcGJvYXJkJywgJ3VuZG8nIF0gfSxcclxuICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdlZGl0aW5nJywgICAgIGdyb3VwczogWyAnZmluZCcsICdzZWxlY3Rpb24nLCAnc3BlbGxjaGVja2VyJyBdIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGlua3MnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZm9ybXMnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICd0b29scyd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnZG9jdW1lbnQnLCBncm91cHM6IFsnbW9kZScsICdkb2N1bWVudCcsICdkb2N0b29scyddfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ290aGVycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAncGFyYWdyYXBoJywgZ3JvdXBzOiBbJ2xpc3QnLCAnaW5kZW50JywgJ2Jsb2NrcycsICdhbGlnbiddfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2NvbG9ycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgICcvJyxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2Jhc2ljc3R5bGVzJywgZ3JvdXBzOiBbJ2Jhc2ljc3R5bGVzJywgJ2NsZWFudXAnXX0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdzdHlsZXMnfSxcclxuICAgICAgICAgICAgICAgICAgICAnLycsXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaW5zZXJ0JywgZ3JvdXBzOiBbICdJbWFnZUJ1dHRvbicgXSAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8ve25hbWU6ICdhYm91dCd9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IudXBkYXRlRWxlbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52bS4kc2V0KHRoaXMuZXhwcmVzc2lvbiwgJCh0aGlzLmVsKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXREYXRhKHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVkaXRvci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGV4dGFyZWEgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBudWxsO1xyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgnc2Nyb2xsYWJsZScsIHtcclxuXHJcbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICQodGhpcy5lbCkuY3NzKHtcclxuICAgICAgICAgICAgJ292ZXJmbG93JzogJ2F1dG8nLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBpZiAoJC5mbi5tQ3VzdG9tU2Nyb2xsYmFyKSB7XHJcbiAgICAgICAgLy8gICAgIFZ1ZS5uZXh0VGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyAgICAgICAgICQodGhpcy5lbCkubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgYXhpczogdGhpcy5leHByZXNzaW9uXHJcbiAgICAgICAgLy8gICAgICAgICB9KTtcclxuICAgICAgICAvLyAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgfSxcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgfSxcclxuICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgndGFncycsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS50YWdzaW5wdXQoe1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiKGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVwb3NpdGlvbihlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkKGVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgZGlhbG9nID0gJCgnLm1vZGFsLWRpYWxvZycsIG1vZGFsKTtcclxuXHJcbiAgICAgICAgICAgIG1vZGFsLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICBkaWFsb2cuY3NzKFwibWFyZ2luLXRvcFwiLCBNYXRoLm1heCgwLCAoJCh3aW5kb3cpLmhlaWdodCgpIC0gZGlhbG9nLmhlaWdodCgpKSAvIDIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJChkb2N1bWVudCksICcubW9kYWwubW9kYWwtY2VudGVyJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHJlcG9zaXRpb24oZS50YXJnZXQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgJCgnLm1vZGFsLm1vZGFsLWNlbnRlcjp2aXNpYmxlJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgcmVwb3NpdGlvbihlbGVtZW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
