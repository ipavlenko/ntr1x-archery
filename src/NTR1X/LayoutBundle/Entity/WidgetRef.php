<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * WidgetRef
 *
 * @ORM\Table(name="widget_refs")
 * @ORM\Entity
 */
class WidgetRef
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
     * @ORM\ManyToOne(targetEntity="Widget", inversedBy="refs")
     * @ORM\JoinColumn(name="widget_id", referencedColumnName="id", nullable=true)
     */
    private $widget;

    /**
     * @ORM\ManyToOne(targetEntity="Page", inversedBy="widgets")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", nullable=false)
     */
    private $page;

	/**
     * @var int
     *
     * @ORM\Column(name="width", type="integer", nullable=false)
     * @Assert\Range(min = 1, max = 12)
     */
    private $width;

    /**
     * @var int
     *
     * @ORM\Column(name="height", type="integer", nullable=false)
     * @Assert\Range(min = 1)
     */
    private $height;

    /**
     * @var int
     *
     * @ORM\Column(name="row", type="integer", nullable=false)
     * @Assert\Range(min = 1)
     */
    private $row;

    /**
     * @var int
     *
     * @ORM\Column(name="col", type="integer", nullable=false)
     * @Assert\Range(min = 1, max = 12)
     */
    private $col;

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
     * Set width
     *
     * @param integer $width
     *
     * @return WidgetRef
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
     * @return WidgetRef
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
     * Set row
     *
     * @param integer $row
     *
     * @return WidgetRef
     */
    public function setRow($row)
    {
        $this->row = $row;

        return $this;
    }

    /**
     * Get row
     *
     * @return integer
     */
    public function getRow()
    {
        return $this->row;
    }

    /**
     * Set col
     *
     * @param integer $col
     *
     * @return WidgetRef
     */
    public function setCol($col)
    {
        $this->col = $col;

        return $this;
    }

    /**
     * Get col
     *
     * @return integer
     */
    public function getCol()
    {
        return $this->col;
    }

    /**
     * Set widget
     *
     * @param \NTR1X\LayoutBundle\Entity\Widget $widget
     *
     * @return WidgetRef
     */
    public function setWidget(\NTR1X\LayoutBundle\Entity\Widget $widget = null)
    {
        $this->widget = $widget;

        return $this;
    }

    /**
     * Get widget
     *
     * @return \NTR1X\LayoutBundle\Entity\Widget
     */
    public function getWidget()
    {
        return $this->widget;
    }

    /**
     * Set page
     *
     * @param \NTR1X\LayoutBundle\Entity\Page $page
     *
     * @return WidgetRef
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
}
