<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * PageMeta
 *
 * @ORM\Table(name="page_sources")
 * @ORM\Entity
 */
class PageSource
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
     * @ORM\ManyToOne(targetEntity="Page", inversedBy="sources")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", nullable=false)
     */
    private $page;

    /**
     * @ORM\ManyToOne(targetEntity="Source")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", nullable=false)
     */
    private $source;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="name", type="string", length=511)
	 */
	private $name;

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
     * Set name
     *
     * @param string $name
     *
     * @return PageSource
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
     * @param \NTR1X\LayoutBundle\Entity\Page $page
     *
     * @return PageSource
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
     * Set source
     *
     * @param \NTR1X\LayoutBundle\Entity\Source $source
     *
     * @return PageSource
     */
    public function setSource(\NTR1X\LayoutBundle\Entity\Source $source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get source
     *
     * @return \NTR1X\LayoutBundle\Entity\Source
     */
    public function getSource()
    {
        return $this->source;
    }
}
