<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Page
 *
 * @ORM\Table(name="page_items")
 * @ORM\Entity(repositoryClass="NTR1X\LayoutBundle\Repository\PageRepository")
 */
class Page
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=511)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="json_array", nullable=false)
     */
    private $title;

    /**
     * @ORM\OneToOne(targetEntity="Resource", cascade={"persist"}, fetch="EAGER")
     * @ORM\JoinColumn(name="resource_id", referencedColumnName="id", nullable=false)
     */
    private $resource;

    /**
     * @ORM\Column(name="metas", type="json_array", nullable=true)
     */
    private $metas;

    /**
     * @ORM\OneToMany(targetEntity="Widget", mappedBy="page", orphanRemoval=true, cascade={"persist", "remove"})
     * @ORM\OrderBy({"index" = "ASC"})
     */
    private $widgets;

    /**
     * @ORM\OneToMany(targetEntity="Source", mappedBy="page", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $sources;

    /**
     * @ORM\OneToMany(targetEntity="Storage", mappedBy="page", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $storages;

    public function __construct() {
        $this->widgets = new ArrayCollection();
        $this->sources = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Page
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set resource
     *
     * @param \NTR1X\LayoutBundle\Entity\Resource $resource
     *
     * @return Page
     */
    public function setResource(\NTR1X\LayoutBundle\Entity\Resource $resource)
    {
        $this->resource = $resource;

        return $this;
    }

    /**
     * Get resource
     *
     * @return \NTR1X\LayoutBundle\Entity\Resource
     */
    public function getResource()
    {
        return $this->resource;
    }

    /**
     * Add source
     *
     * @param \NTR1X\LayoutBundle\Entity\Source $source
     *
     * @return Page
     */
    public function addSource(\NTR1X\LayoutBundle\Entity\Source $source)
    {
        $this->sources[] = $source;

        return $this;
    }

    /**
     * Remove source
     *
     * @param \NTR1X\LayoutBundle\Entity\Source $source
     */
    public function removeSource(\NTR1X\LayoutBundle\Entity\Source $source)
    {
        $this->sources->removeElement($source);
    }

    /**
     * Get sources
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSources()
    {
        return $this->sources;
    }

    /**
     * Set title
     *
     * @param array $title
     *
     * @return Page
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return array
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set metas
     *
     * @param array $metas
     *
     * @return Page
     */
    public function setMetas($metas)
    {
        $this->metas = $metas;

        return $this;
    }

    /**
     * Get metas
     *
     * @return array
     */
    public function getMetas()
    {
        return $this->metas;
    }

    /**
     * Add widget
     *
     * @param \NTR1X\LayoutBundle\Entity\Widget $widget
     *
     * @return Page
     */
    public function addWidget(\NTR1X\LayoutBundle\Entity\Widget $widget)
    {
        $this->widgets[] = $widget;

        return $this;
    }

    /**
     * Remove widget
     *
     * @param \NTR1X\LayoutBundle\Entity\Widget $widget
     */
    public function removeWidget(\NTR1X\LayoutBundle\Entity\Widget $widget)
    {
        $this->widgets->removeElement($widget);
    }

    /**
     * Get widgets
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getWidgets()
    {
        return $this->widgets;
    }

    /**
     * Add storage
     *
     * @param \NTR1X\LayoutBundle\Entity\Storage $storage
     *
     * @return Page
     */
    public function addStorage(\NTR1X\LayoutBundle\Entity\Storage $storage)
    {
        $this->storages[] = $storage;

        return $this;
    }

    /**
     * Remove storage
     *
     * @param \NTR1X\LayoutBundle\Entity\Storage $storage
     */
    public function removeStorage(\NTR1X\LayoutBundle\Entity\Storage $storage)
    {
        $this->storages->removeElement($storage);
    }

    /**
     * Get storages
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getStorages()
    {
        return $this->storages;
    }
}
