<?php

namespace NTR1X\LayoutBundle\Component;

class ComponentAsset {

    private $component;
    private $path;

    public function __construct($component, $path) {

        $this->component = $component;
        $this->path = $path;
    }

    public function getComponent() {
        return $this->component;
    }

    public function getPath() {
        return $this->path;
    }

    public function getAssetPath() {
        return 'bundles/' . $this->component->getProvider()->getAlias() . '/' . $this->path;
    }

    public function getRenderPath() {
        return '@' . $this->component->getProvider()->getBundle() . '/Resources/public/' . $this->path;
    }
}
