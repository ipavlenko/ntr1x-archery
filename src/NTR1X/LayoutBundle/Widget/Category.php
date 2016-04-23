<?php

namespace NTR1X\LayoutBundle\Widget;

use JMS\Serializer\Annotation as JMS;

/**
 * @JMS\ExclusionPolicy("none")
 */
class Category {

    private $name;
    private $title;

    private $categories = [];
    private $widgets = [];

    public function __construct($data) {

        $this->name = $data['name'];
        $this->title = $data['title'];

        $categories = [];

        if (isset($data['items'])) {
            foreach ($data['items'] as $item) {
                $category = new Category($item);
                $categories[$category->getName()] = $category;
            }
        }

        $this->categories = $categories;
    }

    public function getName() {
        return $this->name;
    }

    public function getTitle() {
        return $this->title;
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

    public function registerWidget($widget) {
        $this->widgets[] = $widget;
    }

    public function getWidgets() {
        // TODO Sort
        return array_values($this->widgets);
    }
}
