<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Widget
 *
 * @ORM\Table(name="widget_items")
 * @ORM\Entity
 */
class Widget
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
     * @ORM\OneToOne(targetEntity="Page", inversedBy="root")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $page;

    /**
     * @ORM\ManyToOne(targetEntity="Widget", inversedBy="widgets")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $parent;

    /**
	 * @var int
	 *
	 * @ORM\Column(name="`index`", type="integer")
	 */
    private $index;

    /**
     * @ORM\Column(name="params", type="json_array", nullable=true)
     */
    private $params;

    /**
     * @ORM\OneToMany(targetEntity="Widget", mappedBy="parent", orphanRemoval=true, cascade={"persist", "remove"})
     * @ORM\OrderBy({"index" = "ASC"})
     */
    private $widgets;

	public function __construct() {
        $this->widgets = new ArrayCollection();
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
     * @return Widget
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
     * Set page
     *
     * @param \AppBundle\Entity\Page $page
     *
     * @return Widget
     */
    public function setPage(\AppBundle\Entity\Page $page = null)
    {
        $this->page = $page;

        return $this;
    }

    /**
     * Get page
     *
     * @return \AppBundle\Entity\Page
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * Set params
     *
     * @param array $params
     *
     * @return Widget
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
     * Set parent
     *
     * @param \AppBundle\Entity\Widget $parent
     *
     * @return Widget
     */
    public function setParent(\AppBundle\Entity\Widget $parent = null)
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * Get parent
     *
     * @return \AppBundle\Entity\Widget
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * Set index
     *
     * @param integer $index
     *
     * @return Widget
     */
    public function setIndex($index)
    {
        $this->index = $index;

        return $this;
    }

    /**
     * Get index
     *
     * @return integer
     */
    public function getIndex()
    {
        return $this->index;
    }

    /**
     * Add widget
     *
     * @param \AppBundle\Entity\Widget $widget
     *
     * @return Widget
     */
    public function addWidget(\AppBundle\Entity\Widget $widget)
    {
        $this->widgets[] = $widget;

        return $this;
    }

    /**
     * Remove widget
     *
     * @param \AppBundle\Entity\Widget $widget
     */
    public function removeWidget(\AppBundle\Entity\Widget $widget)
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
}
