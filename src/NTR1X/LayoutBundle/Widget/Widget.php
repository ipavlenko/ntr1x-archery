<?php

namespace NTR1X\LayoutBundle\Widget;

use JMS\Serializer\Annotation as JMS;

/**
 * @JMS\ExclusionPolicy("none")
 */
class Widget {

    private $provider;
    private $id;
    private $name;
    private $tag;
    private $title;
    private $thumbnail;

    private $styles = [];
    private $scripts = [];
    private $templates = [];
    private $props = [];
    private $params = null;
    private $tabs = [];
    private $categories = [];

    public function __construct($provider, $name, $config) {

        $this->provider = $provider;
        $this->name = $name;

        $this->id = $this->provider->getBundle() . '/' . $this->name;

        $this->tag = $config['tag'];
        $this->title = $config['title'];

        if (isset($config['thumbnail'])) {
            $this->thumbnail = new WidgetAsset($this, $config['thumbnail']);
        }

        if (isset($config['categories'])) {
            $this->categories = $config['categories'];
        }

        if (isset($config['tabs'])) {
            foreach ($config['tabs'] as $tab) {
                $this->tabs[] = $tab;
            }
        }

        if (isset($config['props'])) {
            foreach ($config['props'] as $prop) {
                $this->props[] = $prop;
            }
        }

        if (isset($config['params'])) {
            $this->params = $config['params'];
        }

        if (isset($config['styles'])) {
            foreach ($config['styles'] as $path) {
                $this->styles[] = new WidgetAsset($this, $path);
            }
        }

        if (isset($config['scripts'])) {
            foreach ($config['scripts'] as $path) {
                $this->scripts[] = new WidgetAsset($this, $path);
            }
        }

        if (isset($config['templates'])) {
            foreach ($config['templates'] as $path) {
                $this->templates[] = new WidgetAsset($this, $path);
            }
        }
    }

    public function getId() {
        return $this->id;
    }

    public function getProvider() {
        return $this->provider;
    }

    public function getName() {
        return $this->name;
    }

    public function getTag() {
        return $this->tag;
    }

    public function getTitle() {
        return $this->title;
    }

    public function getThumbnail() {
        return $this->thumbnail;
    }

    public function getCategories() {
        return $this->categories;
    }

    public function getProps() {
        return $this->props;
    }

    public function getParams() {
        return $this->params;
    }

    public function getTabs() {
        return $this->tabs;
    }

    public function getStyles() {
        return $this->styles;
    }

    public function getScripts() {
        return $this->scripts;
    }

    public function getTemplates() {
        return $this->templates;
    }
}
