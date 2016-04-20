<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Value
 *
 * @ORM\Table(name="value_items")
 * @ORM\Entity
 */
class Value
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
	 * @ORM\Column(name="value", type="text", nullable=true)
	 */
	private $value;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="binding", type="text", nullable=true)
	 */
	private $binding;

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
     * Set value
     *
     * @param string $value
     *
     * @return Value
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
     * Set binding
     *
     * @param string $binding
     *
     * @return Value
     */
    public function setBinding($binding)
    {
        $this->binding = $binding;

        return $this;
    }

    /**
     * Get binding
     *
     * @return string
     */
    public function getBinding()
    {
        return $this->binding;
    }
}
