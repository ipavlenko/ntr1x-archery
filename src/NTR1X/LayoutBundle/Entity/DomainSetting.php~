<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * DomainSetting
 *
 * @ORM\Table(name="domain_settings")
 * @ORM\Entity
 */
class DomainSetting
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
	 * @ORM\ManyToOne(targetEntity="Domain", inversedBy="settings")
	 * @ORM\JoinColumn(name="domain_id", referencedColumnName="id", nullable=false)
	 */
	private $domain;

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
     * @return DomainSetting
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
     * @return DomainSetting
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
     * Set domain
     *
     * @param \NTR1X\LayoutBundle\Entity\Domain $domain
     *
     * @return DomainSetting
     */
    public function setDomain(\NTR1X\LayoutBundle\Entity\Domain $domain)
    {
        $this->domain = $domain;

        return $this;
    }

    /**
     * Get domain
     *
     * @return \NTR1X\LayoutBundle\Entity\Domain
     */
    public function getDomain()
    {
        return $this->domain;
    }
}
