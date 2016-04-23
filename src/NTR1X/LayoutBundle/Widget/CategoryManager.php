<?php

namespace NTR1X\LayoutBundle\Widget;

class CategoryManager {

    private $providers = [];
    private $categories = [];

    public function register(CategoryProvider $provider) {
        $this->providers[] = $provider;
    }

    public function build() {

        $categories = [];

        foreach ($this->providers as $provider) {
            foreach ($provider->getCategories() as $data) {

                $category = new Category($data);
                $categories[$category->getName()] = $category;
            }
        }

        $this->categories = $categories;
    }

    public function getCategories() {
        // TODO Sort
        return array_values($this->categories);
    }

    public function getCategory($name) {
        return isset($this->categories[$name])
            ? $this->categories[$name]
            : null
        ;
    }

    public function findCategory($fullName) {

        $segments = explode('.', $fullName);

        $container = $this;

        foreach ($segments as $segment) {
            $container = $container->getCategory($segment);
            if ($container == null) break;
        }

        return $container;
    }
}
