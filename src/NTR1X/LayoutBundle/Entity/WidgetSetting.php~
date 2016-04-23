<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * WidgetSetting
 *
 * @ORM\Table(name="widget_settings")
 * @ORM\Entity
 */
class WidgetSetting
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
	 * @ORM\ManyToOne(targetEntity="Widget", inversedBy="settings")
	 * @ORM\JoinColumn(name="widget_id", referencedColumnName="id", nullable=false)
	 */
	private $widget;

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
     * @return WidgetSetting
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
     * @return WidgetSetting
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
     * Set widget
     *
     * @param \NTR1X\LayoutBundle\Entity\Widget $widget
     *
     * @return WidgetSetting
     */
    public function setWidget(\NTR1X\LayoutBundle\Entity\Widget $widget)
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
}
