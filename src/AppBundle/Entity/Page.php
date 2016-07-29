<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Page
 *
 * @ORM\Table(name="page_items")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PageRepository")
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
     * @ORM\ManyToOne(targetEntity="Portal", inversedBy="pages")
     * @ORM\JoinColumn(name="portal_id", referencedColumnName="id", nullable=false)
     */
    private $portal;

    /**
     * @ORM\Column(name="metas", type="json_array", nullable=true)
     */
    private $metas;

    /**
     * @ORM\Column(name="params", type="json_array", nullable=true)
     */
    private $params;

    /**
     * @ORM\OneToOne(targetEntity="Widget", mappedBy="page", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $root;

    /**
     * @ORM\OneToMany(targetEntity="Source", mappedBy="page", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $sources;

    /**
     * @ORM\OneToMany(targetEntity="Storage", mappedBy="page", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $storages;

    public function __construct() {
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
     * Set portal
     *
     * @param \AppBundle\Entity\Portal $portal
     *
     * @return Page
     */
    public function setPortal(\AppBundle\Entity\Portal $portal)
    {
        $this->portal = $portal;

        return $this;
    }

    /**
     * Get portal
     *
     * @return \AppBundle\Entity\Portal
     */
    public function getPortal()
    {
        return $this->portal;
    }

    /**
     * Add source
     *
     * @param \AppBundle\Entity\Source $source
     *
     * @return Page
     */
    public function addSource(\AppBundle\Entity\Source $source)
    {
        $this->sources[] = $source;

        return $this;
    }

    /**
     * Remove source
     *
     * @param \AppBundle\Entity\Source $source
     */
    public function removeSource(\AppBundle\Entity\Source $source)
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
     * Add storage
     *
     * @param \AppBundle\Entity\Storage $storage
     *
     * @return Page
     */
    public function addStorage(\AppBundle\Entity\Storage $storage)
    {
        $this->storages[] = $storage;

        return $this;
    }

    /**
     * Remove storage
     *
     * @param \AppBundle\Entity\Storage $storage
     */
    public function removeStorage(\AppBundle\Entity\Storage $storage)
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

    /**
     * Set params
     *
     * @param array $params
     *
     * @return Page
     */
    public function setParams($params)
    {
        $this->params = $params;

        return $this;
    }

    /**
     * Get params
     *
     * @return array
     */
    public function getParams()
    {
        return $this->params;
    }

    /**
     * Add root
     *
     * @param \AppBundle\Entity\Widget $root
     *
     * @return Page
     */
    public function addRoot(\AppBundle\Entity\Widget $root)
    {
        $this->root[] = $root;

        return $this;
    }

    /**
     * Remove root
     *
     * @param \AppBundle\Entity\Widget $root
     */
    public function removeRoot(\AppBundle\Entity\Widget $root)
    {
        $this->root->removeElement($root);
    }

    /**
     * Get root
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getRoot()
    {
        return $this->root;
    }

    /**
     * Set root
     *
     * @param \AppBundle\Entity\Widget $root
     *
     * @return Page
     */
    public function setRoot(\AppBundle\Entity\Widget $root = null)
    {
        $this->root = $root;

        return $this;
    }
}
