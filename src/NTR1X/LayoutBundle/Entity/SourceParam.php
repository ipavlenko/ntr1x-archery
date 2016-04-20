<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * SourceParam
 *
 * @ORM\Table(name="source_params")
 * @ORM\Entity
 */
class SourceParam
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
     * @ORM\ManyToOne(targetEntity="Source", inversedBy="params")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id", nullable=false)
     */
    private $source;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="name", type="string", length=511)
	 */
	private $name;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="`in`", type="string", length=511)
	 */
	private $in;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="required", type="boolean")
	 */
	private $required;

    /**
     * @var string
     *
     * @ORM\Column(name="specified", type="boolean")
     */
    private $specified;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="type", type="string", length=511)
	 */
	private $type;

	/**
	 * @var Value
	 * 
	 * @ORM\OneToOne(targetEntity="Value", orphanRemoval=true, fetch="EAGER", cascade={"persist", "remove"})
	 * @ORM\JoinColumn(name="value_id", referencedColumnName="id")
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
     * Set name
     *
     * @param string $name
     *
     * @return SourceParam
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
     * Set in
     *
     * @param string $in
     *
     * @return SourceParam
     */
    public function setIn($in)
    {
        $this->in = $in;

        return $this;
    }

    /**
     * Get in
     *
     * @return string
     */
    public function getIn()
    {
        return $this->in;
    }

    /**
     * Set required
     *
     * @param boolean $required
     *
     * @return SourceParam
     */
    public function setRequired($required)
    {
        $this->required = $required;

        return $this;
    }

    /**
     * Get required
     *
     * @return boolean
     */
    public function getRequired()
    {
        return $this->required;
    }

    /**
     * Set type
     *
     * @param string $type
     *
     * @return SourceParam
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
     * Set source
     *
     * @param \NTR1X\LayoutBundle\Entity\Source $source
     *
     * @return SourceParam
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

    /**
     * Set value
     *
     * @param \NTR1X\LayoutBundle\Entity\Value $value
     *
     * @return SourceParam
     */
    public function setValue(\NTR1X\LayoutBundle\Entity\Value $value = null)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return \NTR1X\LayoutBundle\Entity\Value
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Set specified
     *
     * @param boolean $specified
     *
     * @return SourceParam
     */
    public function setSpecified($specified)
    {
        $this->specified = $specified;

        return $this;
    }

    /**
     * Get specified
     *
     * @return boolean
     */
    public function getSpecified()
    {
        return $this->specified;
    }
}
