<?php

namespace NTR1X\LayoutBundle\Widget;

class WidgetNode {

    private $provider;
    private $name;
    private $data;
    private $mergedData;

    public function __construct(WidgetProvider $provider, $name, $data) {

        $this->provider = $provider;
        $this->name = $name;
        $this->data = $data;

        $this->mergedData = $data;

        $this->outgoing = [];
        $this->incoming = [];
    }

    public function isRoot() {
        return empty($this->incoming);
    }

    public function addLinkTo(WidgetNode $target) {
        $this->outgoing[$target->getId()] = $target;
        $target->incoming[$this->getId()] = $this;
    }

    public function removeLinkTo(WidgetNode $target) {
        unset($this->outgoing[$target->getId()]);
        unset($target->incoming[$this->getId()]);
    }

    public function mergeTo(WidgetNode $target) {
        $target->mergedData = array_merge_recursive($this->mergedData, $target->mergedData);
    }

    public function getId() {
        return $this->provider->getBundle() . '/' . $this->name;
    }

    public function getOutgoing() {
        return $this->outgoing;
    }

    public function getIncoming() {
        return $this->incoming;
    }

    public function getProvider() {
        return $this->provider;
    }

    public function getName() {
        return $this->name;
    }

    public function getData() {
        return $this->data;
    }

    public function getMergedData() {
        return $this->mergedData;
    }
}
