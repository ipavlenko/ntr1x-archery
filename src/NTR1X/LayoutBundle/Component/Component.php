<?php

namespace NTR1X\LayoutBundle\Component;

class Component {

    private $provider;

    private $level = 4;
    private $styles = [];
    private $scripts = [];
    private $templates = [];

    public function __construct($provider, $config) {

        $this->provider = $provider;

        if (isset($config['level'])) {
            $this->level = (int) $config['level'];
        }

        if (isset($config['styles'])) {
            foreach ($config['styles'] as $path) {
                $this->styles[] = new ComponentAsset($this, $path);
            }
        }

        if (isset($config['scripts'])) {
            foreach ($config['scripts'] as $path) {
                $this->scripts[] = new ComponentAsset($this, $path);
            }
        }

        if (isset($config['templates'])) {
            foreach ($config['templates'] as $path) {
                $this->templates[] = new ComponentAsset($this, $path);
            }
        }
    }

    public function getProvider() {
        return $this->provider;
    }

    public function getLevel() {
        return $this->level;
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
