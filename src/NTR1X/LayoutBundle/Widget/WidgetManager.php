<?php

namespace NTR1X\LayoutBundle\Widget;

class WidgetManager {

    private $providers = [];
    private $widgets = [];

    public function register(WidgetProvider $provider) {
        $this->providers[] = $provider;
    }

    public function build(CategoryManager $categories) {

        $list = [];
        $roots = [];
        $graph = [];

        // Make a graph
        foreach ($this->providers as $provider) {
            foreach ($provider->getWidgets() as $name => $widget) {
                $node = new WidgetNode($provider, $name, $widget);
                $graph[$node->getId()] = $node;
            }
        }

        foreach ($graph as $node) {

            if (isset($node->getData()['mixins'])) {

                foreach ($node->getData()['mixins'] as $mixin) {

                    $id = (strrpos($mixin, '/') !== false)
                        ? $mixin
                        : $node->getProvider()->getBundle() . '/' . $mixin
                    ;

                    if (isset($graph[$id])) {
                        $source = $graph[$id];
                        $source->addLinkTo($node);
                    } else {
                        // TODO log missing mixin
                    }
                }
            }
        }

        foreach ($graph as $node) {
            if ($node->isRoot()) {
                $roots[] = $node;
            }
        }

        // dump($graph);

        // Kahn's topological sort
        while (($source = array_pop($roots)) != null) {

            $list[] = $source;
            foreach ($source->getOutgoing() as $target) {
                $source->mergeTo($target);
                $source->removeLinkTo($target);
                if ($target->isRoot()) {
                    $roots[] = $target;
                }
            }
        }

        // Check for cycles
        foreach ($graph as $node) {

            if (!$node->isRoot()) {
                // TODO log cycle information
            }
        }

        $widgets = [];
        foreach ($list as $node) {
            if (isset($node->getMergedData()['title'])) {
                $widget = new Widget($node->getProvider(), $node->getName(), $node->getMergedData());
                $widgets[] = $widget;
                foreach ($widget->getCategories() as $name) {
                    $category = $categories->findCategory($name);
                    if ($category != null) {
                        $category->registerWidget($widget);
                    }
                }
            }
        }

        $this->widgets = $widgets;
    }

    public function getWidgets() {
        return $this->widgets;
    }

    public function getStyles() {

        $array = [];
        foreach ($this->widgets as $widget) {
            foreach ($widget->getStyles() as $style) {
                $array[] = $style;
            }
        }

        // TODO Отфильтровать дубли
        return $array;
    }

    public function getScripts() {

        $array = [];
        foreach ($this->widgets as $widget) {
            foreach ($widget->getScripts() as $script) {
                $array[] = $script;
            }
        }

        // TODO Отфильтровать дубли
        return $array;
    }

    public function getTemplates() {

        $array = [];
        foreach ($this->widgets as $widget) {
            foreach ($widget->getTemplates() as $template) {
                $array[] = $template;
            }
        }

        // TODO Отфильтровать дубли
        return $array;
    }
}
