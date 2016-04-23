<?php

namespace NTR1X\LayoutBundle\Entity;

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
	 * @ORM\Column(name="type", type="string", length=511)
	 */
	private $type;

    /**
     * @ORM\OneToOne(targetEntity="Page")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", nullable=false)
     */
    private $page;

    /**
     * @ORM\Column(name="params", type="json_array", nullable=true)
     */
    private $params;

    /**
     * @ORM\OneToOne(targetEntity="Resource", cascade={"persist"}, fetch="EAGER")
     * @ORM\JoinColumn(name="resource_id", referencedColumnName="id", nullable=false)
     */
    private $resource;

	public function __construct() {
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
     * Set type
     *
     * @param string $type
     *
     * @return Widget
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
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
     * Set width
     *
     * @param integer $width
     *
     * @return Widget
     */
    public function setWidth($width)
    {
        $this->width = $width;

        return $this;
    }

    /**
     * Get width
     *
     * @return integer
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * Set height
     *
     * @param integer $height
     *
     * @return Widget
     */
    public function setHeight($height)
    {
        $this->height = $height;

        return $this;
    }

    /**
     * Get height
     *
     * @return integer
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * Set x
     *
     * @param integer $x
     *
     * @return Widget
     */
    public function setX($x)
    {
        $this->x = $x;

        return $this;
    }

    /**
     * Get x
     *
     * @return integer
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     * Set y
     *
     * @param integer $y
     *
     * @return Widget
     */
    public function setY($y)
    {
        $this->y = $y;

        return $this;
    }

    /**
     * Get y
     *
     * @return integer
     */
    public function getY()
    {
        return $this->y;
    }

    /**
     * Set page
     *
     * @param \NTR1X\LayoutBundle\Entity\Page $page
     *
     * @return Widget
     */
    public function setPage(\NTR1X\LayoutBundle\Entity\Page $page)
    {
        $this->page = $page;

        return $this;
    }

    /**
     * Get page
     *
     * @return \NTR1X\LayoutBundle\Entity\Page
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * Set resource
     *
     * @param \NTR1X\LayoutBundle\Entity\Resource $resource
     *
     * @return Widget
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
}
