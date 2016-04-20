<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * PageSetting
 *
 * @ORM\Table(name="page_settings")
 * @ORM\Entity
 */
class PageSetting
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
	 * @ORM\ManyToOne(targetEntity="Page", inversedBy="settings")
	 * @ORM\JoinColumn(name="page_id", referencedColumnName="id", nullable=false)
	 */
	private $page;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="`key`", type="string", length=511)
	 */
	private $key;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="value", type="text")
	 */
	private $value;

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
     * Set key
     *
     * @param string $key
     *
     * @return PageSetting
     */
    public function setKey($key)
    {
        $this->key = $key;

        return $this;
    }

    /**
     * Get key
     *
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * Set value
     *
     * @param string $value
     *
     * @return PageSetting
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return string
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set page
     *
     * @param \NTR1X\LayoutBundle\Entity\Page $page
     *
     * @return PageSetting
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
