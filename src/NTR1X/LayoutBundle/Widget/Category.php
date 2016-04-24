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
                $categories[] = $category;
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
        return $this->categories;
    }

    public function getCategory($name) {
        foreach ($this->categories as $category) {
            if ($category->getName() == $name) {
                return $category;
            }
        }
    }

    public function registerWidget($widget) {
        $this->widgets[] = $widget;
    }

    public function getWidgets() {
        return $this->widgets;
    }
}
