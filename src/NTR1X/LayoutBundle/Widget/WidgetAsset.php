<?php

namespace NTR1X\LayoutBundle\Widget;

class WidgetAsset {

    private $widget;
    private $path;

    public function __construct($widget, $path) {

        $this->widget = $widget;
        $this->path = $path;
    }

    public function getWidget() {
        return $this->widget;
    }

    public function getPath() {
        return $this->path;
    }

    public function getAssetPath() {
        return 'bundles/' . $this->widget->getProvider()->getAlias() . '/' . $this->path;
    }

    public function getRenderPath() {
        return '@' . $this->widget->getProvider()->getBundle() . '/Resources/public/' . $this->path;
    }
}
